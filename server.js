import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcrypt';
import mercadopago from 'mercadopago';
import { fileURLToPath } from 'url';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
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

//Ruteo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Servir archivos estáticos desde "pages"
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'public')));


// Ruta limpia para pointofsale.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','inicio', 'index.html'));
});
app.get('/pointofsale', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages','punto-de-venta', 'pointofsale.html'));
});
app.get('/configuracion', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','configuracion', 'configuracion.html'));
});
app.get('/reportes', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','configuracion', 'reportes.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','inicio-de-sesion', 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','inicio-de-sesion', 'register.html'));
});
app.get('/login-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','inicio-de-sesion', 'login-password.html'));
});

app.use('/tickets', express.static(path.join(__dirname, 'tickets'))); // Carpeta para exponer PDFs

// Crear carpeta si no existe
const ticketsPath = path.join(__dirname, 'tickets');
if (!fs.existsSync(ticketsPath)) {
  fs.mkdirSync(ticketsPath);
}
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

app.post('/ventas', async (req, res) => {
    const { productos, total, tipoPago, cliente, pagado } = req.body;

    if (!tipoPago || !productos || productos.length === 0 || pagado === 0) {
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
                        connection.commit(async err => {
                            if (err) {
                                return connection.rollback(() => res.status(500).json({ error: 'Error al confirmar venta.' }));
                            }

                            const ticketDir = path.join(__dirname, 'tickets');
                            if (!fs.existsSync(ticketDir)) {
                                fs.mkdirSync(ticketDir);
                            }

                            // Generar el PDF
                            const pdfPath = path.join(ticketDir, `ticket-${id_venta}.pdf`);
                            const doc = new PDFDocument();
                            doc.pipe(fs.createWriteStream(pdfPath));

                            // Contenido del ticket
                            doc.fontSize(18).text(`Ticket de Venta #${id_venta}`, { align: 'center' }).moveDown();
                            productos.forEach(p => {
                                doc.fontSize(12).text(`${p.nombre} x${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}`);
                            });
                            doc.moveDown().fontSize(14).text(`Total: $${total.toFixed(2)}`, { align: 'right' });
                            doc.text(`Pago: $${pagado.toFixed(2)}`, { align: 'right' });
                            doc.text(`Cambio: $${(pagado - total).toFixed(2)}`, { align: 'right' });
                            doc.text(`Método de pago: ${tipoPago}`, { align: 'right' });
                            doc.end();

                            // Generar URL de descarga y QR
                            const ticketUrl = `http://localhost:3000/tickets/ticket-${id_venta}.pdf`;
                            const qrImage = await QRCode.toDataURL(ticketUrl);

                            // Enviar respuesta final
                            res.json({
                                success: true,
                                id_venta,
                                ticketUrl,
                                qrImage
                            });
                        });
                    })
                    .catch(error => {
                        connection.rollback(() => res.status(400).json({ error: error.toString() }));
                    });
            });
        });
    });
});

// Endpoint para obtener la fecha y hora del servidor
app.get('/hora-servidor', (req, res) => {
    const fechaHora = new Date();
  
    const dia = String(fechaHora.getDate()).padStart(2, '0');
    const mes = String(fechaHora.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
    const anio = fechaHora.getFullYear();
  
    const hora = fechaHora.toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  
    res.json({
      fecha: `${dia}/${mes}/${anio}`,
      hora: hora
    });
  });

  
  // Registrar nuevo cliente
// Ruta para registrar un nuevo cliente
app.post('/cliente', (req, res) => {
    const { nombre_completo, telefono, correo } = req.body;

    if (!nombre_completo || !telefono || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const query = 'INSERT INTO clientes (nombre_completo, telefono, correo, fecha_registro) VALUES (?, ?, ?, NOW())';
    const values = [nombre_completo, telefono, correo];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al insertar cliente:', err);
            return res.status(500).json({ error: 'Error al registrar cliente.' });
        }

        res.status(201).json({ mensaje: 'Cliente registrado exitosamente', id_cliente: results.insertId });
    });
});



//Dar de alta un empleado


// Ruta para alta de empleado
app.post('/altaempleados', (req, res) => {
    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      correo,
      telefono,
      puesto,
      contrasena,
      id_responsable,
      contrasena_responsable
    } = req.body;
  
    // Validar existencia del responsable
    connection.query('SELECT * FROM empleados WHERE id_empleado = ? AND activo = 1', [id_responsable], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al validar responsable' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'ID de responsable inválido o inactivo' });
      }
      const responsable = results[0];
      const passwordValida = await bcrypt.compare(contrasena_responsable, responsable.contrasena_hash);
      if (!passwordValida) {
        return res.status(401).json({ error: 'Contraseña del responsable incorrecta' });
      }
  
      // Generar datos para el nuevo empleado
      const nombreCompleto = `${primer_nombre} ${segundo_nombre || ''} ${primer_apellido} ${segundo_apellido || ''}`.toUpperCase().trim();
      const ultimos3 = telefono.slice(-3);
      const username = `${primer_nombre.toUpperCase()}${ultimos3}`;
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      const fechaHoy = new Date().toISOString().split('T')[0];
  
      const query = `
        INSERT INTO empleados (nombre_completo, cargo, username, correo, telefono, contrasena_hash, fecha_contratacion, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [nombreCompleto, puesto, username, correo, telefono, contrasenaHash, fechaHoy, 1];
  
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al registrar empleado' });
        }
  
        res.status(201).json({
          message: 'Empleado registrado con éxito',
          id: result.insertId,
          username
        });
      });
    });
  });



  //Api para login local

  app.post('/login', (req, res) => {
    const { username, contrasena } = req.body;
  
    if (!username || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }
  
    const query = 'SELECT * FROM empleados WHERE username = ? AND activo = 1';
  
    connection.query(query, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al consultar' });
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
      }
  
      const empleado = results[0];
      const valid = await bcrypt.compare(contrasena, empleado.contrasena_hash);
      if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });
      res.json({
        success: true,
        empleado: {
          id_empleado: empleado.id_empleado,
          username: empleado.username,
          nombre_completo: empleado.nombre_completo
        }
      });
      
    });
  });

  // Ruta para agregar producto
app.post('/agregar-producto', (req, res) => {
    const { nombre, precio, stock, descripcion } = req.body;
  
    const nuevoProducto = {
      nombre,
      descripcion,
      precio,
      stock,
      fecha_creacion: new Date(),
      activo: 1
    };
  
    const query = 'INSERT INTO productos SET ?';
    connection.query(query, nuevoProducto, (err, result) => {
      if (err) {
        console.error('Error al insertar el producto:', err);
        return res.status(500).json({ mensaje: 'Error al insertar el producto' });
      }
      res.status(201).json({ mensaje: 'Producto agregado con éxito', id: result.insertId });
    });
  });
  


  ///Pago con mercado pago
mercadopago.configure({
    access_token:'TEST-4621541618541712-042220-4dcfeeb53d968a34c84e411bad744900-1462138141'
});
app.post('/mercadoqr', async (req, res) => {
    const { monto } = req.body;
  
    try {
      const preference = await mercadopago.preferences.create({
        items: [
          {
            title: "Pago con QR",
            quantity: 1,
            currency_id: "MXN",
            unit_price: parseFloat(monto),
          },
        ],
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }],
          installments: 1
        },
        back_urls: {
          success: "http://localhost:3000/confirmacion",
        },
      });
  
      const qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${preference.body.init_point}`;
      res.json({ qr_url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al generar el QR' });
    }
  });


  app.post('/generar-ticket', async (req, res) => {
    const { idVenta, productos, total } = req.body;
  
    const pdfPath = path.join(ticketsPath, `ticket-${idVenta}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
  
    // Encabezado
    doc.fontSize(18).text(`Ticket de Venta #${idVenta}`, { align: 'center' }).moveDown();
  
    // Lista de productos
    productos.forEach(p => {
      doc.fontSize(12).text(`${p.descripcion} x${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}`);
    });
  
    doc.moveDown();
    doc.fontSize(14).text(`Total: $${total.toFixed(2)}`, { align: 'right' });
  
    doc.end();
  
    // Generar QR que apunte a la ruta de descarga
    const url = `http://localhost:3000/tickets/ticket-${idVenta}.pdf`;
    const qr = await QRCode.toDataURL(url);
  
    res.json({
      success: true,
      downloadUrl: url,
      qrImage: qr // base64 para mostrar directamente en <img>
    });
  });