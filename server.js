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
import http from 'http';
import { Server } from 'socket.io';
const app = express();



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*" // 👈 Permitir conexión de todos lados en pruebas
  }
});
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

// WebSocket conexión
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado a WebSocket');

  socket.on('disconnect', () => {
      console.log('❌ Cliente desconectado');
  });
});

// Exporta io para usarlo en tu webhook
export { io };

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
// // Iniciar el servidor
// app.listen(port, () => {
//     console.log(`Servidor corriendo en http://localhost:${port}`);
// });
// Iniciar servidor
server.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
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
                telefono: results[0][0].telefono,
                id_cliente: results[0][0].id_cliente
            };
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





app.post('/ventas', async (req, res) => {
  const { productos, total, cliente, pagado, porPagar, cambio, tipoPago, empleado,  nom_cliente } = req.body;
  if (!tipoPago || productos.length === 0 || pagado <= 0) {
    return res.status(400).json({ error: 'Datos incompletos para registrar la venta.' });
  }

  connection.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Error al iniciar transacción.' });

    const ventaQuery = `
      INSERT INTO ventas (total, pagado, por_pagar, cambio, id_cliente, id_empleado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(ventaQuery, [total, pagado, porPagar, cambio, cliente , empleado, ], (err, result) => {
      if (err) return connection.rollback(() => res.status(500).json({ error: 'Error al insertar venta.' }));

      const id_venta = result.insertId;
      const detalleValues = productos.map(p => [id_venta, p.id, p.cantidad, p.precio]);

      connection.query(`INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES ?`, [detalleValues], (err) => {
        if (err) return connection.rollback(() => res.status(500).json({ error: 'Error al insertar detalle de venta.' }));

        const updateStock = productos.map(p => new Promise((resolve, reject) => {
          connection.query(
            `UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?`,
            [p.cantidad, p.id, p.cantidad],
            (err, result) => {
              if (err || result.affectedRows === 0) return reject(`Error al actualizar stock para ${p.id}`);
              resolve();
            }
          );
        }));

        Promise.all(updateStock)
          .then(() => {
            const pagos = Array.isArray(tipoPago) ? tipoPago : [{ metodo: tipoPago, monto: pagado }];
            const insertarPagos = pagos.map(tp => new Promise((resolve, reject) => {
              connection.query('SELECT id_tipo_pago FROM tipo_pago WHERE descripcion = ?', [tp.metodo], (err, results) => {
                if (err || !results.length) return reject(`No se encontró el tipo de pago: ${tp.metodo}`);
                connection.query(`INSERT INTO pagos (id_venta, id_tipo_pago, monto) VALUES (?, ?, ?)`,
                  [id_venta, results[0].id_tipo_pago, tp.monto], (err) => {
                    if (err) return reject('Error al insertar pago.');
                    resolve();
                  });
              });
            }));

            Promise.all(insertarPagos)
              .then(async () => {
                connection.commit(async err => {
                  if (err) return connection.rollback(() => res.status(500).json({ error: 'Error al confirmar venta.' }));
                
                  const ticketDir = path.join(__dirname, 'tickets');
                  if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir);
                
                  const pdfPath = path.join(ticketDir, `ticket-${id_venta}.pdf`);
                  const doc = new PDFDocument({ margin: 20, size: [250, 600] });
                  doc.pipe(fs.createWriteStream(pdfPath));
                
                  doc.fontSize(14).text('ECO POS', { align: 'center' });
                  doc.fontSize(10).text('RFC: ECO123456789', { align: 'center' });
                  doc.text('Calle Principal #123', { align: 'center' });
                  doc.text('Tel: 312-123-4567', { align: 'center' });
                  doc.moveDown();
                
                  doc.text(`Fecha: ${new Date().toLocaleString('es-MX')}`);
                  doc.text(`Ticket No: ${id_venta}`);
                  doc.text(`Cliente: ${nom_cliente}`);
                  doc.moveDown().text('------------------------------------------');
                
                  productos.forEach(p => {
                    const line = `${p.nombre} x${p.cantidad} $${parseFloat(p.precio).toFixed(2)}`;
                    const total = `$${(p.precio * p.cantidad).toFixed(2)}`;
                    doc.text(line, { continued: true }).text(total, { align: 'right' });
                  });
                
                  doc.moveDown().text('------------------------------------------');
                  doc.text(`Total: $${total.toFixed(2)}`, { align: 'right' });
                  doc.text(`Pagado: $${pagado.toFixed(2)}`, { align: 'right' });
                  doc.text(`Cambio: $${cambio.toFixed(2)}`, { align: 'right' });
                
                  // 🔄 Consultar métodos de pago REALES desde BD
                  connection.query(`
                    SELECT tp.descripcion AS metodo, p.monto
                    FROM pagos p
                    JOIN tipo_pago tp ON p.id_tipo_pago = tp.id_tipo_pago
                    WHERE p.id_venta = ?
                  `, [id_venta], async (err, pagosRegistrados) => {
                    if (err) return res.status(500).json({ error: 'Error al obtener métodos de pago' });
                
                    doc.moveDown().text('Métodos de pago:', { underline: true });
                    pagosRegistrados.forEach(p => {
                      doc.text(`${p.metodo}: $${parseFloat(p.monto).toFixed(2)}`);
                    });
                
                    doc.moveDown().fontSize(11).text('¡Gracias por su compra!', { align: 'center' });
                
                    const ticketUrl = `http://localhost:3000/tickets/ticket-${id_venta}.pdf`;
                    const qrImage = await QRCode.toDataURL(ticketUrl);
                    const base64 = qrImage.replace(/^data:image\/png;base64,/, '');
                    const buffer = Buffer.from(base64, 'base64');
                    doc.image(buffer, { width: 100, align: 'center' });
                
                    doc.end();
                
                    res.json({ success: true, id_venta, ticketUrl, qrImage });
                  });
                });
              })
              .catch(error => connection.rollback(() => res.status(400).json({ error: error.toString() })));
          })
          .catch(error => connection.rollback(() => res.status(400).json({ error: error.toString() })));
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

  // Verificar si el teléfono ya existe
  const checkQuery = 'SELECT id_cliente FROM clientes WHERE telefono = ?';
  connection.query(checkQuery, [telefono], (checkErr, checkResults) => {
      if (checkErr) {
          console.error('Error al verificar teléfono:', checkErr);
          return res.status(500).json({ error: 'Error al verificar el teléfono.' });
      }

      if (checkResults.length > 0) {
          return res.status(409).json({ error: 'El número de teléfono ya está registrado.' });
      }

      // Insertar nuevo cliente
      const insertQuery = 'INSERT INTO clientes (nombre_completo, telefono, correo, fecha_registro) VALUES (?, ?, ?, NOW())';
      const values = [nombre_completo, telefono, correo];

      connection.query(insertQuery, values, (insertErr, results) => {
          if (insertErr) {
              console.error('Error al insertar cliente:', insertErr);
              return res.status(500).json({ error: 'Error al registrar cliente.' });
          }

          res.status(201).json({ mensaje: 'Cliente registrado exitosamente', id_cliente: results.insertId });
      });
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
  
      // Buscar si ya existe una apertura de caja hoy
      const hoy = new Date();
      const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0); // 00:00:00 de hoy
  
      const checkQuery = `
      SELECT m1.id FROM movimientos_caja m1
      WHERE m1.id_empleado = ? AND m1.id_tipo_movimiento = 1
      AND NOT EXISTS (
        SELECT 1 FROM movimientos_caja m2
        WHERE m2.id_empleado = m1.id_empleado
          AND m2.id_tipo_movimiento = 2
          AND m2.fecha > m1.fecha
      )
      ORDER BY m1.fecha DESC
      LIMIT 1
    `;
  
      connection.query(checkQuery, [empleado.id_empleado, inicioDia], (checkErr, checkResults) => {
        if (checkErr) return res.status(500).json({ error: 'Error al verificar apertura de caja' });
  
        if (checkResults.length === 0) {
          // No hay apertura hoy, insertarla
          const insertQuery = `
            INSERT INTO movimientos_caja (id_empleado, id_tipo_movimiento, fecha)
            VALUES (?, 1, NOW())
          `;
          connection.query(insertQuery, [empleado.id_empleado], (insertErr) => {
            if (insertErr) return res.status(500).json({ error: 'Error al registrar apertura de caja' });
  
            // Enviar respuesta con apertura registrada
            res.json({
              success: true,
              apertura_registrada: true,
              empleado: {
                id_empleado: empleado.id_empleado,
                username: empleado.username,
                nombre_completo: empleado.nombre_completo
              }
            });
          });
        } else {
          // Ya había apertura registrada hoy
          res.json({
            success: true,
            apertura_registrada: false,
            empleado: {
              id_empleado: empleado.id_empleado,
              username: empleado.username,
              nombre_completo: empleado.nombre_completo
            }
          });
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
        back_urls: {
          success: "http://localhost:3000/confirmacion",
        },
        notification_url: "https://d85a-189-195-132-181.ngrok-free.app/webhook", // ✅ válida aquí
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

  // Webhook para Mercado Pago
app.post('/webhook', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    const paymentId = data.id;

    try {
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === 'approved') {
        console.log('✅ Pago aprobado. Emitiendo evento por WebSocket...');
        io.emit('pago-aprobado', {
          monto: payment.body.transaction_amount
        });
      }
    } catch (error) {
      console.error('❌ Error consultando pago:', error);
    }
  }

  res.sendStatus(200);
});

app.post('/retiros', (req, res) => {
  const { cantidad, motivo, username, contraseña } = req.body;

  if (!cantidad || !motivo || !username || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Buscar cajero
  connection.query('SELECT id_empleado, contrasena_hash FROM empleados WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la consulta.' });
    if (results.length === 0) return res.status(404).json({ error: 'Cajero no encontrado.' });

    const empleado = results[0];
    
    // Comparar contraseñas
    bcrypt.compare(contraseña, empleado.contrasena_hash, (err, coinciden) => {
      if (err || !coinciden) return res.status(401).json({ error: 'Contraseña incorrecta.' });

      // Ejecutar el SP
      connection.query('CALL sp_registrar_retiro(?, ?, ?)', [cantidad, motivo, empleado.id_empleado], (err) => {
        if (err) return res.status(500).json({ error: 'Error al registrar el retiro.' });

        res.json({ success: true, message: 'Retiro registrado correctamente.' });
      });
    });
  });
});


//Api para ver todos los productos
app.get('/productos', (req, res) => {
  connection.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos.' });
    res.json(results);
  });
});

// Ruta para autenticar cajero
app.post('/autenticar-cajero', (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const query = 'SELECT * FROM empleados WHERE username = ?'; // o usa nombre_usuario si así lo tienes

  connection.query(query, [usuario], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const empleado = results[0];

    bcrypt.compare(contrasena, empleado.contrasena_hash, (err, valid) => {
      if (err || !valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

      // Si todo está bien, responder con los datos necesarios para el corte
      res.json({ success: true, empleado: { id: empleado.id_empleado, nombre: empleado.nombre } });
    });
  });
});
//mostrar el resumen del turno
app.post('/resumen-turno', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Usuario requerido' });

  try {
    connection.query('CALL sp_resumen_turno_usuario(?)', [username], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al ejecutar SP' });
      }

      // El resultado viene como un arreglo de arreglos
      const resumen = results[0][0] || {};  // Primer resultado del primer recordset

      res.json({
        efectivo: resumen.total_efectivo || 0,
        tarjeta: resumen.total_tarjeta || 0,
        mercado_pago: resumen.total_mercado_pago || 0,
        retiros: resumen.total_retiros || 0,
        total_venta: resumen.total || 0
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/aplicar-cierre', (req, res) => {
  const { id_empleado, faltante, sobrante, montoCorrecto } = req.body;

  if (!id_empleado || montoCorrecto === undefined) {
    return res.status(400).json({ success: false, error: 'Datos incompletos' });
  }

  connection.query(
    `INSERT INTO movimientos_caja (id_tipo_movimiento, fecha, id_empleado, Faltante, Sobrante, MontoCorrecto)
     VALUES (2, NOW(), ?, ?, ?, ?)`,
    [id_empleado, faltante || 0, sobrante || 0, montoCorrecto],
    (err, result) => {
      if (err) {
        console.error('Error al insertar cierre en movimientos_caja:', err);
        return res.status(500).json({ success: false, error: 'Error al guardar cierre de caja' });
      }

      // ✅ Solo esta respuesta debe enviarse en éxito
      return res.json({ success: true, message: 'Cierre de caja registrado correctamente.' });
    }
  );
});






