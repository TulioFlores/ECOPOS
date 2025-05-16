const express = require('express');
const mysql = require('mysql2');
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cors());
app.use(express.json());
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecopos'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para el registro
app.post('/register', async (req, res) => {
    const { correo, nombre, apellidos, puesto, contraseña } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

        const query = 'INSERT INTO usuarios (correo, nombre, apellidos, puesto, contraseña) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [correo, nombre, apellidos, puesto, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error al registrar:', err);
                return res.status(400).json({ 
                    success: false, 
                    mensaje: 'Error al registrar. Tal vez el correo ya existe.' 
                });
            }

            res.json({ 
                success: true, 
                mensaje: 'Registro exitoso',
                redirectTo: '/login.html'
            });
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).json({ success: false, mensaje: 'Error en el servidor' });
    }
});


// Servir archivos estáticos
app.use(express.static(__dirname));

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


app.post("/login", (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json("Faltan datos");
  }

  db.query("SELECT * FROM usuarios WHERE correo = ?", [correo], async (err, results) => {
    if (err) return res.status(500).json("Error de servidor");

    if (results.length === 0) return res.status(401).json("Usuario no encontrado");

    const user = results[0];

    const esCorrecta = await bcrypt.compare(contraseña, user.contrasena);

    if (!esCorrecta) return res.status(401).json("Contraseña incorrecta");

    // Devuelve el rol
    res.json({
      mensaje: "Inicio de sesión exitoso",
      rol: user.rol // ← Aquí debe devolver "gerente" o "empleado"
    });
  });
});