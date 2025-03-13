// Importa mysql2
const mysql = require('mysql2');

// Configura la conexión a MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'negocio_1'
});

// Función para llamar al Stored Procedure
function obtenerProductos(idProducto, callback) {
  const query = 'CALL sp_obtenerProductos(?)';
  
  connection.query(query, [idProducto], (err, results) => {
      if (err) {
          console.error('Error al llamar al Stored Procedure:', err);
          return callback(err, null);
      }

      // Convierte los resultados al formato deseado
      const productosDB = results[0].map(producto => ({
          id: producto.id_producto,
          descripcion: producto.nombre, // Ajusta el nombre si es necesario
          precio: producto.precio
      }));

      callback(null, productosDB);
  });
}

// Llamar al SP y mostrar los productos en el nuevo formato
obtenerProductos(null, (err, productosDB) => {
  if (err) return console.error('Error:', err);
  console.log('Productos en formato personalizado:', productosDB);
});




// Cierra la conexión cuando termines
process.on('exit', () => connection.end());
