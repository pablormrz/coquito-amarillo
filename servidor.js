/**
 * =======================================================
 * Coquito Amarillo S.A.S. — Servidor Backend
 * Archivo: servidor.js
 * Descripción: Servidor Express que gestiona el registro de pedidos
 *              utilizando Programación Orientada a Objetos (POO),
 *              validaciones centralizadas y persistencia dual
 *              concurrente (archivo CSV y base de datos MySQL).
 * =======================================================
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// ---------- Configuración del Entorno y Base de Datos ----------
const PUERTO = 3000;
const RUTA_CSV = path.join(__dirname, "Datos.csv");

/**
 * Parámetros de conexión a la base de datos MySQL
 */
const CONFIG_BD = {
    host: "localhost",
    user: "root",
    password: "", // Contraseña de MySQL en caso de tenerla configurada
    database: "coquito_amarillo"
};

// ---------- POO: Clase que encapsula el pedido ----------

/**
 * Clase que representa un pedido registrado en el sistema.
 * Aplica el principio de encapsulamiento utilizando atributos privados (#)
 * y proporciona acceso controlado mediante getters.
 */
class RegistroPedido {
    #nombreCliente;
    #producto;
    #cantidad;
    #correo;
    #fecha;

    /**
     * Crea una instancia de RegistroPedido.
     * @param {string} nombreCliente - Nombre del cliente
     * @param {string} producto - Nombre del producto solicitado
     * @param {number|string} cantidad - Unidades solicitadas
     * @param {string} correo - Correo electrónico de contacto
     */
    constructor(nombreCliente, producto, cantidad, correo) {
        this.#nombreCliente = String(nombreCliente).trim();
        this.#producto = String(producto).trim();
        this.#cantidad = Number(cantidad);
        this.#correo = String(correo).trim();
        this.#fecha = new Date().toISOString();
    }

    // Métodos Getters públicos para lectura de atributos privados
    get nombreCliente() { return this.#nombreCliente; }
    get producto() { return this.#producto; }
    get cantidad() { return this.#cantidad; }
    get correo() { return this.#correo; }
    get fecha() { return this.#fecha; }

    /**
     * Valida los datos crudos recibidos desde la petición.
     * @param {Object} datos - Objeto con los datos del pedido recibidos en el cuerpo de la petición.
     * @returns {string[]} Lista de mensajes de error encontrados (vacía si todo es válido).
     */
    static validar(datos) {
        const errores = [];
        const textos = {
            nombreCliente: datos.nombreCliente,
            producto: datos.producto
        };

        // Ciclo + decisiones: revisa cada campo de texto obligatorio
        for (const [campo, valor] of Object.entries(textos)) {
            if (typeof valor !== "string" || valor.trim() === "") {
                errores.push(`El campo ${campo} es obligatorio`);
            } else if (valor.trim().length > 100) {
                errores.push(`El campo ${campo} no puede superar 100 caracteres`);
            }
        }

        // Validación de cantidad numérica entera positiva
        const cantidad = Number(datos.cantidad);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            errores.push("La cantidad debe ser un entero mayor que cero");
        }

        // Validación de formato de correo electrónico mediante expresión regular
        const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof datos.correo !== "string" || !patronCorreo.test(datos.correo.trim())) {
            errores.push("El correo electrónico no es válido");
        } else if (datos.correo.trim().length > 150) {
            errores.push("El correo no puede superar 150 caracteres");
        }

        return errores;
    }

    /**
     * Transforma la instancia en una línea formateada para archivo CSV,
     * escapando comas, saltos de línea y comillas dobles para cumplir con RFC 4180.
     * @returns {string} Fila en formato CSV con salto de línea.
     */
    toCSV() {
        const campos = [this.#nombreCliente, this.#producto, this.#cantidad, this.#correo, this.#fecha];
        const escapados = campos.map((c) => {
            const texto = String(c);
            return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
        });
        return escapados.join(",") + "\n";
    }
}

// ---------- POO: Herencia y Patrón Repositorio ----------

/**
 * Clase base abstracta para la capa de persistencia de datos.
 */
class Repositorio {
    /**
     * Guarda un registro de pedido en el medio de almacenamiento correspondiente.
     * @param {RegistroPedido} registro - Instancia del pedido a guardar.
     * @throws {Error} Si no es implementado en la subclase.
     */
    async guardar(registro) {
        throw new Error("guardar() debe implementarse en la subclase");
    }
}

/**
 * Repositorio para persistir registros en un archivo plano CSV.
 * @extends Repositorio
 */
class RepositorioCSV extends Repositorio {
    /**
     * Inicializa el repositorio y crea el archivo con encabezados si no existe.
     * @param {string} ruta - Ruta absoluta del archivo CSV en el sistema de archivos.
     */
    constructor(ruta) {
        super();
        this.ruta = ruta;
        if (!fs.existsSync(ruta)) {
            // Crea el archivo con encabezados la primera vez
            fs.writeFileSync(ruta, "nombre_cliente,producto,cantidad,correo,fecha\n", "utf8");
        }
    }

    /**
     * Agrega el registro al final del archivo CSV sin sobreescribir los datos previos.
     * @param {RegistroPedido} registro - Instancia del pedido.
     */
    async guardar(registro) {
        await fs.promises.appendFile(this.ruta, registro.toCSV(), "utf8");
    }
}

/**
 * Repositorio para persistir registros en la base de datos relacional MySQL.
 * @extends Repositorio
 */
class RepositorioMySQL extends Repositorio {
    /**
     * Inicializa el pool de conexiones a MySQL.
     * @param {Object} config - Configuración de conexión de mysql2.
     */
    constructor(config) {
        super();
        this.pool = mysql.createPool(config);
    }

    /**
     * Inserta el registro en la tabla 'registros' usando consultas parametrizadas.
     * @param {RegistroPedido} registro - Instancia del pedido.
     */
    async guardar(registro) {
        const sql = "INSERT INTO registros (nombre_cliente, producto, cantidad, correo) VALUES(?, ?, ?, ?)";
        await this.pool.execute(sql, [registro.nombreCliente, registro.producto, registro.cantidad, registro.correo]);
    }

    /**
     * Prueba si la conexión con la base de datos se realiza con éxito.
     */
    async probarConexion() {
        const conexion = await this.pool.getConnection();
        conexion.release();
    }
}

// ---------- Configuración del Servidor Express ----------

const app = express();

// Middlewares para procesar cuerpos JSON y formularios codificados en URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (HTML, CSS, JS, imágenes, SVG)
app.use(express.static(path.join(__dirname, "public")));

// Instanciación de los repositorios
const repoCSV = new RepositorioCSV(RUTA_CSV);
const repoMySQL = new RepositorioMySQL(CONFIG_BD);

/**
 * Ruta GET principal: sirve el formulario de registro de pedidos.
 */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "formulario.html"));
});

/**
 * Ruta POST /registrar: recibe los datos del pedido, los valida y los
 * persiste de manera concurrente en MySQL y en el archivo CSV.
 */
app.post("/registrar", async (req, res) => {
    try {
        const datos = req.body ?? {};

        // Validar datos según reglas de negocio
        const errores = RegistroPedido.validar(datos);
        if (errores.length > 0) {
            return res.status(400).json({ error: errores.join(". ") });
        }

        // Crear instancia del pedido encapsulada
        const registro = new RegistroPedido(datos.nombreCliente, datos.producto, datos.cantidad, datos.correo);

        // Guardar en ambos destinos de manera concurrente con Promise.allSettled
        const resultados = await Promise.allSettled([
            repoCSV.guardar(registro),
            repoMySQL.guardar(registro)
        ]);

        const destinos = ["CSV", "MySQL"];
        const fallos = [];

        // Evaluar resultados de cada repositorio
        resultados.forEach((r, i) => {
            if (r.status === "rejected") {
                console.error(`Error al guardar en ${destinos[i]}:`, r.reason);
                fallos.push(destinos[i]);
            }
        });

        // Si falló el guardado en uno o ambos destinos
        if (fallos.length > 0) {
            return res.status(500).json({
                error: `No se pudo guardar en: ${fallos.join(" y ")}`
            });
        }

        // Respuesta exitosa al cliente
        res.status(201).json({ mensaje: "Registro guardado exitosamente" });
    } catch (error) {
        console.error("Error inesperado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ---------- Inicialización del Servidor ----------

app.listen(PUERTO, async () => {
    console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
    try {
        await repoMySQL.probarConexion();
        console.log("Conexión a MySQL establecida");
    } catch (error) {
        console.error("No se pudo conectar a MySQL:", error.message);
    }
});