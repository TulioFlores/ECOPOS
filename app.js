const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia esto según tu configuración
  password: '', // Cambia esto también
  database: 'ecopunto'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL.');
});

// Ruta para manejar el registro de asistencia
app.post('/registrar-asistencia', (req, res) => {
  const { id_empleado, tipo } = req.body;

  if (!id_empleado || !tipo) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const fecha_hora = new Date();

  const query = 'INSERT INTO asistencia (id_empleado, fecha_hora, tipo) VALUES (?, ?, ?)';
  db.query(query, [id_empleado, fecha_hora, tipo], (err, result) => {
    if (err) {
      console.error('Error al insertar en la base de datos:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.status(200).json({ mensaje: 'Asistencia registrada correctamente' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});