require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { body, param, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Pool de conexión MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Validación personalizada para URL de imagen
const validateImageUrl = (value) => {
    if (!value) return true; // Opcional
    const pattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i;
    return pattern.test(value);
};

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Rutas para Proveedores
app.get('/api/proveedores', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Proveedores WHERE activo = TRUE');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});

app.post('/api/proveedores', 
    [
        body('nombre').trim().notEmpty().withMessage('El nombre es requerido')
            .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
            .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
        
        body('correo').trim().notEmpty().withMessage('El correo es requerido')
            .isEmail().withMessage('Debe ser un correo electrónico válido'),
        
        body('telefono').trim().notEmpty().withMessage('El teléfono es requerido')
            .isLength({ min: 10, max: 15 }).withMessage('El teléfono debe tener entre 10 y 15 dígitos')
            .isNumeric().withMessage('El teléfono solo puede contener números'),
        
        body('productos_principales').optional().trim()
            .isLength({ max: 100 }).withMessage('Los productos no pueden exceder 100 caracteres'),
        
        body('logo_url').optional().trim()
            .custom(validateImageUrl).withMessage('La URL del logo debe ser una imagen válida (png, jpg, jpeg, gif o svg)')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { nombre, correo, telefono, logo_url, productos_principales } = req.body;

            const [result] = await pool.query(
                'INSERT INTO Proveedores (nombre, correo, telefono, logo_url, productos_principales) VALUES (?, ?, ?, ?, ?)',
                [nombre, correo, telefono, logo_url || null, productos_principales || null]
            );
            
            res.status(201).json({ 
                id: result.insertId,
                message: 'Proveedor registrado exitosamente'
            });
            
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            
            // Manejo de errores de MySQL
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El correo o teléfono ya están registrados' });
            }
            
            res.status(500).json({ error: 'Error al crear proveedor' });
        }
    }
);

app.put('/api/proveedores/:id',
    [
        param('id').isInt().withMessage('ID de proveedor inválido'),
        
        body('nombre').trim().notEmpty().withMessage('El nombre es requerido')
            .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
            .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
        
        body('correo').trim().notEmpty().withMessage('El correo es requerido')
            .isEmail().withMessage('Debe ser un correo electrónico válido'),
        
        body('telefono').trim().notEmpty().withMessage('El teléfono es requerido')
            .isLength({ min: 10, max: 15 }).withMessage('El teléfono debe tener entre 10 y 15 dígitos')
            .isNumeric().withMessage('El teléfono solo puede contener números'),
        
        body('productos_principales').optional().trim()
            .isLength({ max: 100 }).withMessage('Los productos no pueden exceder 100 caracteres'),
        
        body('logo_url').optional().trim()
            .custom(validateImageUrl).withMessage('La URL del logo debe ser una imagen válida (png, jpg, jpeg, gif o svg)')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, correo, telefono, logo_url, productos_principales } = req.body;

            // Verificar si el proveedor existe
            const [proveedor] = await pool.query(
                'SELECT id_proveedor FROM Proveedores WHERE id_proveedor = ? AND activo = TRUE',
                [id]
            );
            
            if (proveedor.length === 0) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            await pool.query(
                'UPDATE Proveedores SET nombre = ?, correo = ?, telefono = ?, logo_url = ?, productos_principales = ? WHERE id_proveedor = ?',
                [nombre, correo, telefono, logo_url || null, productos_principales || null, id]
            );
            
            res.json({ 
                success: true,
                message: 'Proveedor actualizado exitosamente'
            });
            
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El correo o teléfono ya están registrados' });
            }
            
            res.status(500).json({ error: 'Error al actualizar proveedor' });
        }
    }
);

app.delete('/api/proveedores/:id',
    [
        param('id').isInt().withMessage('ID de proveedor inválido')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar si el proveedor existe
            const [proveedor] = await pool.query(
                'SELECT id_proveedor FROM Proveedores WHERE id_proveedor = ? AND activo = TRUE',
                [id]
            );
            
            if (proveedor.length === 0) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            // Eliminación lógica
            await pool.query(
                'UPDATE Proveedores SET activo = FALSE WHERE id_proveedor = ?',
                [id]
            );
            
            res.json({ 
                success: true,
                message: 'Proveedor eliminado exitosamente'
            });
            
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            res.status(500).json({ error: 'Error al eliminar proveedor' });
        }
    }
);

// Rutas para Visitas
app.get('/api/visitas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT v.*, p.nombre as nombre_proveedor 
            FROM Visitas_Proveedores v
            JOIN Proveedores p ON v.id_proveedor = p.id_proveedor
            WHERE v.estado != 'Cancelada'
            ORDER BY v.fecha_visita DESC, v.hora_visita DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener visitas:', error);
        res.status(500).json({ error: 'Error al obtener visitas' });
    }
});

app.post('/api/visitas',
    [
        body('id_proveedor').isInt().withMessage('ID de proveedor inválido'),
        
        body('fecha_visita').isDate().withMessage('Fecha inválida')
            .custom((value, { req }) => {
                const today = new Date().toISOString().split('T')[0];
                return value >= today;
            }).withMessage('La fecha no puede ser anterior al día actual'),
        
        body('hora_visita').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida')
            .custom((value) => {
                const [hours] = value.split(':');
                return hours >= 8 && hours <= 18;
            }).withMessage('La hora debe estar entre 8:00 y 18:00'),
        
        body('motivo').trim().notEmpty().withMessage('El motivo es requerido')
            .isLength({ max: 200 }).withMessage('El motivo no puede exceder 200 caracteres'),
        
        body('id_empleado_responsable').optional().isInt().withMessage('ID de empleado inválido')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id_proveedor, fecha_visita, hora_visita, motivo, id_empleado_responsable } = req.body;

            // Verificar si el proveedor existe
            const [proveedor] = await pool.query(
                'SELECT id_proveedor FROM Proveedores WHERE id_proveedor = ? AND activo = TRUE',
                [id_proveedor]
            );
            
            if (proveedor.length === 0) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const [result] = await pool.query(
                'INSERT INTO Visitas_Proveedores (id_proveedor, fecha_visita, hora_visita, motivo, id_empleado_responsable) VALUES (?, ?, ?, ?, ?)',
                [id_proveedor, fecha_visita, hora_visita, motivo, id_empleado_responsable || null]
            );
            
            res.status(201).json({ 
                id: result.insertId,
                message: 'Visita registrada exitosamente'
            });
            
        } catch (error) {
            console.error('Error al crear visita:', error);
            res.status(500).json({ error: 'Error al crear visita' });
        }
    }
);

app.delete('/api/visitas/:id',
    [
        param('id').isInt().withMessage('ID de visita inválido')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar si la visita existe y no está cancelada
            const [visita] = await pool.query(
                'SELECT id_visita FROM Visitas_Proveedores WHERE id_visita = ? AND estado != "Cancelada"',
                [id]
            );
            
            if (visita.length === 0) {
                return res.status(404).json({ error: 'Visita no encontrada o ya cancelada' });
            }

            await pool.query(
                "UPDATE Visitas_Proveedores SET estado = 'Cancelada' WHERE id_visita = ?",
                [id]
            );
            
            res.json({ 
                success: true,
                message: 'Visita cancelada exitosamente'
            });
            
        } catch (error) {
            console.error('Error al cancelar visita:', error);
            res.status(500).json({ error: 'Error al cancelar visita' });
        }
    }
);

// Rutas para Productos
app.get('/api/productos/bajo-stock', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, pr.nombre as nombre_proveedor 
            FROM Productos p
            JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
            WHERE p.stock < p.stock_minimo AND p.activo = TRUE
            ORDER BY p.stock / p.stock_minimo ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos bajo stock:', error);
        res.status(500).json({ error: 'Error al obtener productos bajo stock' });
    }
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});