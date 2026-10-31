/**
 * =======================================================
 * Coquito Amarillo S.A.S. — Lógica Frontend (Cliente)
 * Archivo: app.js
 * Descripción: Captura los eventos del formulario, envía los
 *              datos al servidor vía Fetch API y muestra mensajes
 *              de confirmación o error en pantalla.
 * =======================================================
 */

// Referencias a los elementos del DOM
const formulario = document.getElementById("formPedido");
const mensaje = document.getElementById("mensaje");

// Escuchar el evento de envío del formulario
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // Evita la recarga por defecto de la página

    // Extraer y limpiar los valores ingresados por el usuario
    const datos = {
        nombreCliente: formulario.elements.nombreCliente.value.trim(),
        producto: formulario.elements.producto.value.trim(),
        cantidad: Number(formulario.elements.cantidad.value),
        correo: formulario.elements.correo.value.trim()
    };

    try {
        // Enviar la petición POST al backend en formato JSON
        const respuesta = await fetch("/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        // Si el servidor responde con código de error (4xx o 5xx)
        if (!respuesta.ok) {
            throw new Error(resultado.error || "Error desconocido al procesar el pedido");
        }

        // Mostrar retroalimentación de éxito al usuario
        mensaje.textContent = resultado.mensaje;
        mensaje.className = "exito";

        // Limpiar todos los campos del formulario tras un registro exitoso
        formulario.reset();
    } catch (error) {
        // Mostrar retroalimentación de error al usuario
        mensaje.textContent = error.message;
        mensaje.className = "error";
    }
});