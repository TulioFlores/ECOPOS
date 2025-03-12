const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',     // Dirección del servidor MySQL
  user: 'root',    // Usuario de MySQL
  password: '', // Contraseña de MySQL
  database: 'negocio_1' // Nombre de la base de datos
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Ruta para obtener productos
app.get('/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener los productos');
      return;
    }
    res.json(results);
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


// Llama a la API y muestra los productos
async function cargarProductos() {
    try {
      const respuesta = await fetch('http://localhost:3000/productos');
      const productos = await respuesta.json();
      console.log(productos);
      productos.forEach(producto => {
        document.body.innerHTML += `
          <p>${producto.nombre} - $${producto.precio}</p>
        `;
      });
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }
  
  cargarProductos();