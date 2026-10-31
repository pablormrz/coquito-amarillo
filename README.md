# Sistema de pedidos — Coquito Amarillo S.A.S.
## Descripción
Aplicación web que registra pedidos en Datos.csv y en MySQL.
## Requisitos
- Node.js (LTS)
- MySQL 8 (o XAMPP)
## Instalación
1. npm install
2. mysql -u root -p -e "source database/script.sql"
3. Si tu MySQL tiene contraseña, edítala en CONFIG_BD de servidor.js
## Ejecución
node servidor.js
Abrir http://localhost:3000
## Estructura
(carpetas del proyecto)
## Decisiones de diseño
- Clase RegistroPedido: encapsula y valida los datos.
- Repositorio / RepositorioCSV / RepositorioMySQL: herencia para el acceso a
datos.
- Promise.allSettled: guarda en CSV y MySQL a la vez.