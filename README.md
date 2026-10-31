# Sistema de pedidos — Coquito Amarillo S.A.S.

## Descripción
Aplicación web que registra pedidos en Datos.csv y en MySQL.

### Diseño de la Interfaz
![Diseño de la Interfaz](capturas/Diseño.png)

## Requisitos
- Node.js (LTS)
- MySQL 8 (o XAMPP)
## Instalación
1. Clonar el repositorio y entrar a la carpeta:
   ```bash
   git clone https://github.com/pablormrz/coquito-amarillo.git
   cd coquito-amarillo
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Importar la base de datos:
   ```bash
   mysql -u root -p -e "source database/script.sql"
   ```
4. Si tu MySQL tiene contraseña, edítala en `CONFIG_BD` de `servidor.js`
## Ejecución
1. **Asegurar que MySQL esté en ejecución:**
   - Si usas **XAMPP**: Abre el *Panel de Control de XAMPP* y presiona **Start** en el módulo **MySQL**.
   - Si usas **MySQL Workbench / Servicio de Windows**: Verifica que el servicio de MySQL esté iniciado.
2. **Iniciar el servidor:**
   ```bash
   node servidor.js
   ```
3. **Acceder a la aplicación:**
   - Abre tu navegador web en [http://localhost:3000](http://localhost:3000)
## Estructura
```text
coquito-amarillo/
├── capturas/               # Evidencias y capturas de pantalla de la ejecución
│   ├── Consola ServidorJS.png
│   ├── Diseño.png
│   ├── Envío Exitoso.png
│   ├── Fomulario Lleno.png
│   └── Registros MySQL.png
├── database/               # Scripts para la base de datos
│   └── script.sql          # Creación de la base de datos y tabla
├── public/                 # Archivos estáticos del frontend
│   ├── app.js              # Lógica del cliente y envío al servidor (Fetch API)
│   ├── estilos.css         # Hoja de estilos con diseño en tonos pastel
│   ├── formulario.html     # Estructura del formulario web
│   └── logo.svg            # Logo y favicon de coco amarillo
├── Datos.csv               # Almacenamiento plano de los registros
├── package.json            # Metadatos del proyecto y dependencias
├── package-lock.json       # Árbol exacto de dependencias instaladas
├── README.md               # Documentación general del proyecto
└── servidor.js             # Servidor Express, lógica POO y repositorios
```
## Decisiones de diseño

### 1. Backend y Gestión de Datos
- **Validación y consistencia:** Se verifican todos los datos ingresados (campos obligatorios, formato de correo y cantidades válidas) antes de procesarlos para evitar registros incompletos o erróneos.
- **Doble almacenamiento independiente:** Cada pedido se guarda simultáneamente en base de datos (MySQL) y en un archivo de respaldo (CSV), garantizando que la información se conserve incluso si uno de los medios falla.
- **Estructura modular:** El código se organizó en componentes separados para que el sistema sea claro, seguro y fácil de mantener o escalar en el futuro.

### 2. Interfaz y Experiencia de Usuario (UI / UX)
- **Envío ágil y sin recargas:** El formulario procesa la solicitud de forma inmediata, mostrando avisos claros de éxito o error sin tener que reiniciar la página.
- **Identidad visual personalizada:** Uso de una paleta en tonos pastel (amarillo y crema) acorde a la marca, acompañada de un logotipo vectorial y tipografía moderna y legible.
- **Diseño interactivo y moderno:** Efecto de tarjeta translúcida con bordes suaves, animaciones sutiles y retroalimentación visual al interactuar con los campos y el botón de envío.
- **Diseño adaptable:** La interfaz se ajusta automáticamente para una visualización cómoda y limpia tanto en computadores como en dispositivos móviles.