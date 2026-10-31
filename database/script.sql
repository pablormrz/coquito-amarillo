-- =======================================================
-- Base de datos: coquito_amarillo
-- Descripción: Almacenamiento relacional de pedidos de clientes
-- =======================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS coquito_amarillo;
USE coquito_amarillo;

-- Tabla para almacenar los registros de pedidos
CREATE TABLE IF NOT EXISTS registros (
    id INT AUTO_INCREMENT PRIMARY KEY,                -- Identificador único autonumérico
    nombre_cliente VARCHAR(100) NOT NULL,             -- Nombre completo del cliente (obligatorio)
    producto VARCHAR(100) NOT NULL,                   -- Nombre o descripción del producto (obligatorio)
    cantidad INT NOT NULL,                            -- Cantidad solicitada (entero mayor a cero)
    correo VARCHAR(150),                              -- Correo electrónico de contacto
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP -- Fecha y hora de inserción automática
);