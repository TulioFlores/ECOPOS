import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware para permitir peticiones desde el navegador
app.use(cors());
app.use(express.json());

// Configurar la conexión a MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'negocio_1'
});

connection.connect(err => {
    if (err) {
        console.error('Error de conexión a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Endpoint para obtener un producto por ID usando el Stored Procedure
app.get('/producto/:id', (req, res) => {
    const idProducto = req.params.id;
    const query = 'CALL sp_obtenerProductos(?)';
    connection.query(query, [idProducto], (err, results) => {
        if (err) {
            console.error('Error al llamar al Stored Procedure:', err);
            res.status(500).json({ error: 'Error al obtener el producto' });
            return;
        }
        if (results[0].length > 0) {
            const producto = {
                id: results[0][0].id_producto,
                descripcion: results[0][0].nombre,
                precio: results[0][0].precio
            };
            res.json(producto);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    });
});

app.get('/buscar/:nombre', (req, res) => {
    const nombreBuscado = req.params.nombre;
    const query = 'CALL sp_buscarProductos(?)';
    connection.query(query, [nombreBuscado], (err, results) => {
        if (err) {
            console.error('Error al llamar al Stored Procedure:', err);
            res.status(500).json({ error: 'Error al buscar productos' });
            return;
        }

        if (results[0].length > 0) {
            // Formatear la respuesta
            const productos = results[0].map(producto => ({
                id: producto.id_producto,
                descripcion: producto.nombre,
                stock: producto.stock,
                precio: producto.precio
            }));
            res.json(productos);
        } else {
            res.status(404).json({ error: 'No se encontraron productos' });
        }
    });
});



app.get('/empleado/:id', (req, res) => {
    const idEmpleado = req.params.id;
    const query = 'CALL sp_obtenerNombre(?)';
    connection.query(query, [idEmpleado], (err, results) => {
        if (err) {
            console.error('Error al llamar al Stored Procedure:', err);
            res.status(500).json({ error: 'Error al obtener el empleado' });
            return;
        }
        
        if (results[0].length > 0) {
            // Aquí asumimos que el nombre está en la primera fila y columna
            const empleado = {
                nombre: results[0][0].nombre_completo
            };
            res.json(empleado);
        } else {
            res.status(404).json({ error: 'Empleado no encontrado' });
        }
    });
});

// Endpoint para obtener un cliente por numero de telefono
app.get('/cliente/:telefono', (req, res) => {
    const telefono = req.params.telefono;
    const query = 'CALL sp_obtenerTelefono(?)';
    connection.query(query, [telefono], (err, results) => {
        if (err) {
            console.error('Error al llamar al Stored Procedure:', err);
            res.status(500).json({ error: 'Error al obtener el cliente' });
            return;
        }
        if (results[0].length > 0) {
            const cliente = {
                nombre: results[0][0].nombre_completo,
                telefono: results[0][0].telefono
            };
            console.log(cliente)
            res.json(cliente);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    });
});
app.get('/clientes/sugerencias/:telefono', (req, res) => {
    const telefono = req.params.telefono;

    const query = `SELECT nombre_completo AS nombre, telefono FROM Clientes WHERE telefono LIKE ? LIMIT 5`;
    connection.query(query, [`%${telefono}%`], (err, results) => {
        if (err) {
            console.error('Error al buscar sugerencias:', err);
            res.status(500).json({ error: 'Error al buscar sugerencias' });
            return;
        }

        res.json(results);
    });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

//Api para realizar la venta

// BACKEND (Node.js - api/ventas.js)
const router = express.Router();

app.post('/ventas', async (req, res) => {
    const { productos, total, tipoPago, cliente } = req.body;

    if (!tipoPago || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos para registrar la venta.' });
    }

    // Asignar valores de cliente y empleado (ajustar lógica si se requiere autenticación)
    const id_cliente = null; // Por ahora se puede dejar null si es "General"
    const id_empleado = null; // Puedes asignar desde sesión si lo manejas

    connection.beginTransaction(err => {
        if (err) return res.status(500).json({ error: 'Error al iniciar transacción.' });

        const ventaQuery = `
            INSERT INTO Ventas (id_cliente, id_empleado, metodo_pago, estado)
            VALUES (?, ?, ?, 'Completada')
        `;
        connection.query(ventaQuery, [id_cliente, id_empleado, tipoPago], (err, result) => {
            if (err) {
                return connection.rollback(() => res.status(500).json({ error: 'Error al insertar venta.' }));
            }

            const id_venta = result.insertId;

            const detalleQuery = `
                INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario)
                VALUES ?
            `;
            const detalleValues = productos.map(item => [
                id_venta,
                item.id,
                item.cantidad,
                item.precio
            ]);

            connection.query(detalleQuery, [detalleValues], (err) => {
                if (err) {
                    return connection.rollback(() => res.status(500).json({ error: 'Error al insertar detalle de venta.' }));
                }

                const updateStockTasks = productos.map(item => {
                    return new Promise((resolve, reject) => {
                        const updateQuery = `
                            UPDATE Productos SET stock = stock - ?
                            WHERE id_producto = ? AND stock >= ?
                        `;
                        connection.query(updateQuery, [item.cantidad, item.id, item.cantidad], (err, result) => {
                            if (err || result.affectedRows === 0) {
                                return reject(`Error al actualizar stock para el producto ${item.id}`);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(updateStockTasks)
                    .then(() => {
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => res.status(500).json({ error: 'Error al confirmar venta.' }));
                            }
                            res.json({ success: true, id_venta });
                        });
                    })
                    .catch(error => {
                        connection.rollback(() => res.status(400).json({ error: error.toString() }));
                    });
            });
        });
    });
});




