const mysql = require('mysql');

const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'ecopos',
    user: 'root',
    password: ''
});

conexion.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos');
    }
});

//  Exportar la conexión
module.exports = conexion;
