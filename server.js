import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mysql from 'mysql2/promise';
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
import session from 'express-session';
import { body, param, validationResult } from 'express-validator';
import fileUpload from 'express-fileupload';

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP Server y WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: "sid",
  secret: "clave_secreta_segura",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  }
}));

// Configurar express-fileupload
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// MySQL Pool
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

// Verificar conexión inicial
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err);
  });

// WebSocket
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado a WebSocket');

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
  });
});

// Exportar WebSocket
export { io };
//Ruteo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Servir archivos estáticos desde "pages"
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'public')));

function verificarAutenticacion(req, res, next) {
  if (req.session.usuario) {
    // Si la ruta es /pointofsale, requiere puntoVentaAutenticado
    if (req.path === '/pointofsale') {
      if (req.session.usuario.puntoVentaAutenticado) {
        return next();
      } else {
        return res.redirect('/login');
      }
    }
    // Para otras rutas, basta con que exista la sesión
    return next();
  } else {
    return res.redirect('/login');
  }
}
//  Funcion para verificar que es gerente
function soloGerentes(req, res, next) {
  if (req.session.usuario.cargo === 'Gerente') {
    return next();
  } else {
    return res.status(403).send('Acceso denegado: No autorizado');
  }
}




// Ruta limpia para pointofsale.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','inicio', 'index.html'));
});
app.get('/ayuda', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','configuracion', 'ayuda.html'));
});
app.get('/pointofsale', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'pages','punto-de-venta', 'pointofsale.html'));
});
app.get('/login', (req, res) => {
    // Verificar si existe una sesión activa
    if (req.session.usuario) {
        // Redirigir según el cargo
        if (req.session.usuario.cargo === 'Gerente') {
            res.redirect('/reportes');
        } else {
            res.redirect('/reportes-emp');
        }
    } else {
        // Si no hay sesión, mostrar la página de login
        res.sendFile(path.join(__dirname, 'pages','inicio-de-sesion', 'login.html'));
    }
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','inicio-de-sesion', 'register.html'));
});
app.get('/login-password', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','inicio-de-sesion', 'login-password.html'));
});
app.get('/reportes-emp', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages','configuracion', 'reportes-empleado.html'));
});
app.get('/reportes', verificarAutenticacion, soloGerentes, (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'configuracion', 'reportes-admin.html'));
});
app.use('/tickets', express.static(path.join(__dirname, 'tickets'))); // Carpeta para exponer PDFs


// Iniciar servidor
server.listen(3000, '0.0.0.0',() => {
  console.log('Servidor escuchando en http://localhost:3000');
});
// Crear carpeta si no existe
const ticketsPath = path.join(__dirname, 'tickets');
if (!fs.existsSync(ticketsPath)) {
  fs.mkdirSync(ticketsPath);
}
// Producto por ID
app.get('/producto/:id', async (req, res) => {
  const idProducto = req.params.id;
  try {
    const [results] = await pool.execute('CALL sp_obtenerProductos(?)', [idProducto]);
    const resultado = results[0][0];
    if (resultado) {
      if (resultado.mensaje === 'SIN STOCK') {
        return res.status(409).json({ error: 'Sin stock disponible' });
      } else if (resultado.mensaje === 'PRODUCTO NO ENCONTRADO') {
        return res.status(404).json({ error: 'Producto no encontrado' });
      } else {
        return res.json({
          id: resultado.id_producto,
          descripcion: resultado.nombre,
          precio: resultado.precio,
          stock: resultado.stock
        });
      }
    } else {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// Buscar productos por nombre
app.get('/buscar/:nombre', async (req, res) => {
  const nombreBuscado = req.params.nombre;
  try {
    const [results] = await pool.execute('CALL sp_buscarProductos(?)', [nombreBuscado]);
    if (results[0].length > 0) {
      const productos = results[0].map(producto => ({
        id: producto.codigo_barras,
        descripcion: producto.nombre,
        stock: producto.stock,
        precio: producto.precio
      }));
      res.json(productos);
    } else {
      res.status(404).json({ error: 'No se encontraron productos' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
});

// Empleado por ID
app.get('/empleado/:id', async (req, res) => {
  const idEmpleado = req.params.id;
  try {
    const [results] = await pool.execute('CALL sp_obtenerNombre(?)', [idEmpleado]);
    if (results[0].length > 0) {
      res.json({ nombre: results[0][0].nombre_completo });
    } else {
      res.status(404).json({ error: 'Empleado no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el empleado' });
  }
});

// Cliente por teléfono
app.get('/cliente/:telefono', async (req, res) => {
  const telefono = req.params.telefono;
  try {
    const [results] = await pool.execute('CALL sp_obtenerTelefono(?)', [telefono]);
    if (results[0].length > 0) {
      const cliente = results[0][0];

    // Guardar como cookies seguras
    res.cookie('id_cliente', cliente.id_cliente, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000, // 1 hora
    });
    res.cookie('nom_cliente', cliente.nombre_completo, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000,
    });
      res.json({
        nombre: cliente.nombre_completo
      });
    } else {
      res.status(404).json({ error: 'Cliente no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
});

// Sugerencias de clientes
app.get('/clientes/sugerencias/:telefono', async (req, res) => {
  const telefono = req.params.telefono;
  try {
    const [results] = await pool.execute(
      'SELECT nombre_completo AS nombre, telefono FROM Clientes WHERE telefono LIKE ? LIMIT 5',
      [`%${telefono}%`]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar sugerencias' });
  }
});

// Registrar nuevo cliente
app.post('/cliente', async (req, res) => {
  const { nombre_completo, telefono, correo } = req.body;
  if (!nombre_completo || !telefono || !correo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const [checkResults] = await pool.execute('SELECT id_cliente FROM clientes WHERE telefono = ?', [telefono]);
    if (checkResults.length > 0) {
      return res.status(409).json({ error: 'El número de teléfono ya está registrado.' });
    }

    const [results] = await pool.execute(
      'INSERT INTO clientes (nombre_completo, telefono, correo, fecha_registro) VALUES (?, ?, ?, NOW())',
      [nombre_completo, telefono, correo]
    );

    res.status(201).json({ mensaje: 'Cliente registrado exitosamente', id_cliente: results.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar cliente.' });
  }
});

// Alta de empleado
app.post('/altaempleados', async (req, res) => {
  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    correo,
    telefono,
    puesto,
    contrasena,
    contrasena_responsable,
    contrasena_responsable_conf
  } = req.body;

  if (contrasena_responsable !== contrasena_responsable_conf) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  const conn = await pool.getConnection();
  try {
    const [gerenteRows] = await conn.execute(
      'SELECT * FROM empleados WHERE cargo = "Gerente" AND activo = 1 LIMIT 1'
    );

    if (gerenteRows.length === 0) {
      return res.status(401).json({ error: 'No hay ningún gerente activo en el sistema' });
    }

    const gerente = gerenteRows[0];
    const passwordValida = await bcrypt.compare(contrasena_responsable, gerente.contrasena_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta del gerente' });
    }

    const ultimos3 = telefono.slice(-3);
    const username = `${primer_nombre.toUpperCase()}${ultimos3}`;
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const fechaHoy = new Date().toISOString().split('T')[0];

    const [result] = await conn.execute(`
      INSERT INTO empleados 
      (primer_nom, segundo_nom, primer_ap, segundo_ap, cargo, username, correo, telefono, contrasena_hash, fecha_contratacion, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, puesto, username,
      correo, telefono, contrasenaHash, fechaHoy, 1
    ]);

    res.status(201).json({
      message: 'Empleado registrado con éxito',
      id: result.insertId,
      username,
      success: true
    });
  } catch (error) {
    console.error(error);
    // Manejo específico de duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage && error.sqlMessage.includes('correo')) {
        return res.status(409).json({ error: 'El correo ya está registrado.' });
      } else if (error.sqlMessage && error.sqlMessage.includes('telefono')) {
        return res.status(409).json({ error: 'El teléfono ya está registrado.' });
      } else {
        return res.status(409).json({ error: 'El dato ya está registrado.' });
      }
    }
    res.status(500).json({ error: 'Error en el proceso de alta de empleado' });
  } finally {
    conn.release();
  }
});

// Fecha y hora del servidor
app.get('/hora-servidor', (req, res) => {
  const fechaHora = new Date();
  const dia = String(fechaHora.getDate()).padStart(2, '0');
  const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
  const anio = fechaHora.getFullYear();
  const hora = fechaHora.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  res.json({
    fecha: `${dia}/${mes}/${anio}`,
    hora: hora
  });
});
app.post('/ventas', async (req, res) => {
  const { productos, total, cliente, pagado, porPagar, cambio, tipoPago, nom_cliente } = req.body;
  if (!tipoPago || productos.length === 0 || pagado <= 0) {
    return res.status(400).json({ error: 'Datos incompletos para registrar la venta.' });
  }
  const empleado = req.session.usuario.id;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const ventaQuery = `
      INSERT INTO ventas (total, pagado, por_pagar, cambio, id_cliente, id_empleado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [ventaResult] = await connection.query(ventaQuery, [total, pagado, porPagar, cambio, cliente, empleado]);
    const id_venta = ventaResult.insertId;

    const detalleValues = productos.map(p => [id_venta, p.id, p.cantidad, p.precio]);
    await connection.query('INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES ?', [detalleValues]);

    for (const p of productos) {
      const [result] = await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
        [p.cantidad, p.id, p.cantidad]
      );
      if (result.affectedRows === 0) {
        throw new Error(`Error al actualizar stock para ${p.id}`);
      }
    }

    const pagos = Array.isArray(tipoPago) ? tipoPago : [{ metodo: tipoPago, monto: pagado }];
    for (const tp of pagos) {
      const [rows] = await connection.query('SELECT id_tipo_pago FROM tipo_pago WHERE descripcion = ?', [tp.metodo]);
      if (!rows.length) {
        throw new Error(`No se encontró el tipo de pago: ${tp.metodo}`);
      }
      await connection.query(
        'INSERT INTO pagos (id_venta, id_tipo_pago, monto) VALUES (?, ?, ?)',
        [id_venta, rows[0].id_tipo_pago, tp.monto]
      );
    }

    await connection.commit();

    const ticketDir = path.join(__dirname, 'tickets');
    if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir);

    const pdfPath = path.join(ticketDir, `ticket-${id_venta}.pdf`);
    const doc = new PDFDocument({ margin: 20, size: [250, 600] });
    doc.pipe(fs.createWriteStream(pdfPath));

    // Obtener la configuración de la tienda
    let tienda = {
      nombre: 'ECO POS',
      rfc: 'ECO123456789',
      direccion: 'Calle Principal #123',
      telefono: '312-123-4567'
    };

    try {
      const [configuracion] = await connection.query('SELECT * FROM configuracion_tienda LIMIT 1');
      if (configuracion && configuracion.length > 0) {
        tienda = {
          ...tienda,
          ...configuracion[0]
        };
      }
    } catch (error) {
      console.error('Error al obtener configuración de la tienda:', error);
    }

    // Encabezado del ticket
    if (tienda.logo) {
      try {
        // Remover el slash inicial si existe
        const logoPath = path.join(__dirname, 'public', tienda.logo.startsWith('/') ? tienda.logo.slice(1) : tienda.logo);
        if (fs.existsSync(logoPath)) {
          // Si es un SVG, usar un logo por defecto en PNG
          if (logoPath.toLowerCase().endsWith('.svg')) {
            const defaultLogoPath = path.join(__dirname, 'public', 'logos', 'logo-tienda.png');
            if (fs.existsSync(defaultLogoPath)) {
              doc.image(defaultLogoPath, { width: 100, align: 'center' });
            }
          } else {
            doc.image(logoPath, { width: 100, align: 'center' });
          }
          doc.moveDown();
        } else {
          console.error('Logo no encontrado en:', logoPath);
        }
      } catch (error) {
        console.error('Error al cargar el logo:', error);
      }
    }

    doc.fontSize(14).text(tienda.nombre, { align: 'center' });
    doc.fontSize(10).text(`RFC: ${tienda.rfc}`, { align: 'center' });
    doc.text(tienda.direccion, { align: 'center' });
    doc.text(`Tel: ${tienda.telefono}`, { align: 'center' });
    doc.moveDown();

    doc.text(`Fecha: ${new Date().toLocaleString('es-MX')}`);
    doc.text(`Ticket No: ${id_venta}`);
    doc.text(`Cliente: ${nom_cliente}`);
    doc.moveDown().text('------------------------------------------');

    productos.forEach(p => {
      const line = `${p.nombre} x${p.cantidad} $${parseFloat(p.precio).toFixed(2)}`;
      const totalProd = `$${(p.precio * p.cantidad).toFixed(2)}`;
      doc.text(line, { continued: true }).text(totalProd, { align: 'right' });
    });

    doc.moveDown().text('------------------------------------------');
    const subtotal = total / 1.16;
    const iva = total - subtotal;

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`IVA (16%): $${iva.toFixed(2)}`, { align: 'right' });
    doc.text(`Total (con IVA): $${total.toFixed(2)}`, { align: 'right' });
    doc.text(`Pagado: $${pagado.toFixed(2)}`, { align: 'right' });
    doc.text(`Cambio: $${cambio.toFixed(2)}`, { align: 'right' });

    const [pagosRegistrados] = await connection.query(
      `SELECT tp.descripcion AS metodo, p.monto
       FROM pagos p
       JOIN tipo_pago tp ON p.id_tipo_pago = tp.id_tipo_pago
       WHERE p.id_venta = ?`,
      [id_venta]
    );

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

  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Utilidad para construir el nombre completo
function construirNombreCompleto(empleado) {
  return [empleado.primer_nom, empleado.segundo_nom, empleado.primer_ap, empleado.segundo_ap]
    .filter(Boolean)
    .join(' ');
}

app.post('/abrir-captura-venta', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
    }

    // Buscar empleado por username
    const [rows] = await pool.query('SELECT id_empleado, username, primer_nom, segundo_nom, primer_ap, segundo_ap, contrasena_hash, correo, cargo FROM empleados WHERE username = ? AND activo = 1', [usuario]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado o inactivo' });
    }
    const empleado = rows[0];
    const valid = await bcrypt.compare(contrasena, empleado.contrasena_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Verificar si ya hay una apertura de caja sin corte para este empleado
    const [aperturas] = await pool.query(
      `SELECT id_tipo_movimiento FROM movimientos_caja 
       WHERE id_empleado = ? 
         AND id_tipo_movimiento = 1 
         AND NOT EXISTS (
           SELECT 1 FROM movimientos_caja mc2 
           WHERE mc2.id_empleado = movimientos_caja.id_empleado 
             AND mc2.id_tipo_movimiento = 2 
             AND mc2.fecha > movimientos_caja.fecha
         )
       ORDER BY fecha DESC LIMIT 1`,
      [empleado.id_empleado]
    );

    if (aperturas.length === 0) {
      // No hay apertura sin corte, se puede insertar
      await pool.query(
        'INSERT INTO movimientos_caja (id_tipo_movimiento, fecha, id_empleado) VALUES (1, NOW(), ?)',
        [empleado.id_empleado]
      );
    }

    // Actualizar la sesión para permitir acceso a /pointofsale
    req.session.usuario = {
      id: empleado.id_empleado,
      username: empleado.username,
      nombre: construirNombreCompleto(empleado),
      correo: empleado.correo,
      cargo: empleado.cargo,
      puntoVentaAutenticado: true
    };

    // Obtener clientes (como antes)
    const [clientes] = await pool.execute(
      'SELECT id_cliente, nombre_completo, telefono FROM clientes'
    );

    res.json({ success: true, empleado: req.session.usuario, clientes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al abrir captura de venta' });
  }
});



// Agregar producto
app.post('/api/productos', async (req, res) => {
  const { codigo_barras, nombre, descripcion, precio, stock, stock_minimo, id_proveedor } = req.body;
  try {
    const [result] = await pool.execute(`
      INSERT INTO productos (codigo_barras, nombre, descripcion, precio, stock, stock_minimo, id_proveedor, fecha_creacion, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)
    `, [codigo_barras, nombre, descripcion, precio, stock, stock_minimo, id_proveedor]);

    res.status(201).json({ mensaje: 'Producto agregado', codigo_barras });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    // Manejo específico de duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage && err.sqlMessage.includes('codigo_barras')) {
        return res.status(409).json({ mensaje: 'El código de barras ya está registrado.' });
      } else {
        return res.status(409).json({ mensaje: 'El dato ya está registrado.' });
      }
    }
    res.status(500).json({ mensaje: 'Error al agregar producto' });
  }
});



// Obtener producto por ID
app.get('/api/productos/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const [rows] = await pool.execute('SELECT * FROM productos WHERE codigo_barras = ?', [codigo]);

  if (rows.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  res.json(rows[0]);
});


// Modificar producto
app.put('/api/productos/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { nombre, descripcion, precio, stock, stock_minimo, id_proveedor } = req.body;

  try {
    const [result] = await pool.execute(`
      UPDATE productos
      SET nombre = ?, descripcion = ?, precio = ?, stock = ?, stock_minimo = ?, id_proveedor = ?
      WHERE codigo_barras = ?
    `, [nombre, descripcion, precio, stock, stock_minimo, id_proveedor, codigo]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
});



// Dar de baja producto
app.put('/api/productos/:codigo/baja', async (req, res) => {
  const { codigo } = req.params;
  const [result] = await pool.execute(
    'UPDATE productos SET activo = 0 WHERE codigo_barras = ?',
    [codigo]
  );
  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  res.json({ mensaje: 'Producto dado de baja correctamente' });
});


// Dar de alta producto
app.put('/api/productos/:codigo/alta', async (req, res) => {
  const { codigo } = req.params;
  const [result] = await pool.execute(
    'UPDATE productos SET activo = 1 WHERE codigo_barras = ?',
    [codigo]
  );
  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  res.json({ mensaje: 'Producto dado de alta correctamente' });
});


  


  ///Pago con mercado pago
mercadopago.configure({
    access_token:''
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
        notification_url:  "/webhook" , // ✅ válida aquí
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

app.post('/retiros', async (req, res) => {
  const { cantidad, motivo, username, contraseña } = req.body;
  if (!cantidad || !motivo || !username || !contraseña) return res.status(400).json({ error: 'Todos los campos son obligatorios.' });

  try {
    const [rows] = await pool.query('SELECT id_empleado, contrasena_hash FROM empleados WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(404).json({ error: 'Cajero no encontrado.' });

    const empleado = rows[0];
    const coinciden = await bcrypt.compare(contraseña, empleado.contrasena_hash);
    if (!coinciden) return res.status(401).json({ error: 'Contraseña incorrecta.' });

    await pool.query('CALL sp_registrar_retiro(?, ?, ?)', [cantidad, motivo, empleado.id_empleado]);
    res.json({ success: true, message: 'Retiro registrado correctamente.' });

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});



//Api para ver todos los productos
app.get('/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
});


// Ruta para autenticar cajero
app.post('/autenticar-cajero', async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (!usuario || !contrasena) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  try {
    const [rows] = await pool.query('SELECT * FROM empleados WHERE username = ?', [usuario]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const empleado = rows[0];
    const valid = await bcrypt.compare(contrasena, empleado.contrasena_hash);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({ success: true, empleado: { id: empleado.id_empleado, nombre: empleado.nombre } });
  } catch (err) {
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

//mostrar el resumen del turno
app.post('/resumen-turno', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Usuario requerido' });

  try {
    // Primero obtener el ID del empleado
    const [empleado] = await pool.query('SELECT id_empleado FROM empleados WHERE username = ? AND activo = 1', [username]);
    if (empleado.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    const id_empleado = empleado[0].id_empleado;

    // Obtener el resumen del turno
    const [results] = await pool.query('CALL sp_resumen_turno_usuario(?)', [username]);
    const resumen = results[0][0] || {};
    
    res.json({
      id_empleado,
      efectivo: resumen.total_efectivo || 0,
      tarjeta: resumen.total_tarjeta || 0,
      mercado_pago: resumen.total_mercado_pago || 0,
      retiros: resumen.total_retiros || 0,
      total_venta: resumen.total || 0
    });
  } catch (err) {
    console.error('Error en resumen-turno:', err);
    res.status(500).json({ error: 'Error al ejecutar SP' });
  }
});


app.post('/api/aplicar-cierre', async (req, res) => {
  const { id_empleado, faltante, sobrante, montoCorrecto } = req.body;
  if (!id_empleado || montoCorrecto === undefined) {
    return res.status(400).json({ success: false, error: 'Datos incompletos' });
  }

  try {
    await pool.query(
      `INSERT INTO movimientos_caja (id_tipo_movimiento, fecha, id_empleado, Faltante, Sobrante, MontoCorrecto)
       VALUES (3, NOW(), ?, ?, ?, ?)`,
      [id_empleado, faltante || 0, sobrante || 0, montoCorrecto]
    );
    res.json({ success: true, message: 'Cierre de caja registrado correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al guardar cierre de caja' });
  }
});

//Cierre del dia
app.post('/resumen-dia', async (req, res) => {
  try {
    const [results] = await pool.query('CALL sp_resumen_dia()');
    const data = results[0][0] || {};
    res.json({
      efectivo: data.total_efectivo || 0,
      tarjeta: data.total_tarjeta || 0,
      total_mercado_pago: data.total_mercado_pago || 0,
      total_general: data.total_general || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resumen del día' });
  }
});





// Ruta para manejar el registro de asistencia
app.post('/registrar-asistencia', async (req, res) => {
  const { username, tipo } = req.body;
  if (!username || !tipo) return res.status(400).json({ error: 'Faltan datos requeridos' });

  try {
    // Buscar el id_empleado por username
    const [rows] = await pool.query('SELECT id_empleado FROM empleados WHERE username = ? AND activo = 1', [username]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    const id_empleado = rows[0].id_empleado;

    // Si es entrada o salida, verificar si ya existe una del mismo tipo hoy
    if (tipo === 'Entrada' || tipo === 'Salida') {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const fechaHoy = `${yyyy}-${mm}-${dd}`;
      const [asistencias] = await pool.query(
        `SELECT id_asistencia FROM asistencia WHERE id_empleado = ? AND tipo = ? AND DATE(fecha_hora) = ?`,
        [id_empleado, tipo, fechaHoy]
      );
      if (asistencias.length > 0) {
        return res.status(400).json({ error: `Ya se registró una ${tipo.toLowerCase()} para este usuario hoy.` });
      }
    }

    await pool.query(
      'INSERT INTO asistencia (id_empleado, fecha_hora, tipo) VALUES (?, ?, ?)',
      [id_empleado, new Date(), tipo]
    );
    res.json({ mensaje: 'Asistencia registrada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// Ruta: api/ventas/resumen-intervalo
app.get('/api/ventas/resumen-intervalo', async (req, res) => {
  const { inicio, fin } = req.query;
  if (!inicio || !fin) return res.status(400).json({ error: 'Fechas requeridas' });

  try {
    const [results] = await pool.query('CALL sp_resumen_por_intervalo(?, ?)', [inicio, fin]);
    res.json(results[0][0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el resumen' });
  }
});


//API venta por empleado
app.post('/por-empleado', async (req, res) => {
  const { inicio, fin, username } = req.body;
  if (!inicio || !fin || !username) return res.status(400).json({ success: false, error: 'Datos incompletos' });

  try {
    const [results] = await pool.query('CALL sp_resumen_por_intervalo_empleado(?, ?, ?)', [inicio, fin, username]);
    res.json({ success: true, datos: results[0][0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener el resumen' });
  }
});


// Ruta para el registro
app.post('/register', async (req, res) => {
  const { correo, nombre, apellidos, puesto, contraseña } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await pool.query(
      'INSERT INTO empleados (nombre_completo, cargo, correo, contraseña) VALUES (?, ?, ?, ?, ?)',
      [`${nombre} ${apellidos}`, puesto, correo, hashedPassword]
    );
    res.json({ success: true, mensaje: 'Registro exitoso', redirectTo: '/login.html' });
  } catch (err) {
    res.status(400).json({ success: false, mensaje: 'Error al registrar. Tal vez el correo ya existe.' });
  }
});






app.post("/login-inicio", async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json("Faltan datos");
  }

  try {
    // Determinar si es correo o username
    const esCorreo = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo);
    let rows;
    if (esCorreo) {
      [rows] = await pool.query("SELECT * FROM empleados WHERE correo = ?", [correo]);
    } else {
      [rows] = await pool.query("SELECT * FROM empleados WHERE username = ?", [correo]);
    }

    if (rows.length === 0) {
      return res.status(401).json("Usuario no encontrado");
    }

    const user = rows[0];
    const esCorrecta = await bcrypt.compare(contraseña, user.contrasena_hash);

    if (!esCorrecta) {
      return res.status(401).json("Contraseña incorrecta");
    }

    // Crear sesión
    req.session.usuario = {
      id: user.id_empleado,
      username: user.username,
      nombre: construirNombreCompleto(user),
      correo: user.correo,
      cargo: user.cargo,
      puntoVentaAutenticado: false
    };

    res.json({
      mensaje: "Inicio de sesión exitoso",
      rol: user.cargo
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json("Error de servidor");
  }
});


app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al destruir sesión:", err);
      return res.status(500).json({ mensaje: "Error al cerrar sesión" });
    }

    res.clearCookie("sid"); // Asegúrate de usar el mismo nombre que pusiste en session.name
    res.status(200).json({ mensaje: "Sesión cerrada" });
  });
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
        const [rows] = await pool.query('SELECT * FROM Proveedores WHERE activo = 1');
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
app.get('/productos/bajo-stock', async (req, res) => {
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


//Modificacion de empleados
//Buscar empleado
app.get('/api/empleados/:username', async (req, res) => {
  const { username } = req.params;
  const [rows] = await pool.execute(
    'SELECT * FROM empleados WHERE username = ?',
    [username]
  );
  if (rows.length === 0) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
  res.json(rows[0]);
});

//Modificar empleado
app.put('/api/empleados/:username', async (req, res) => {
  const { username } = req.params;
  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    email,
    telefono,
    contrasena,
    confirmar_contrasena,
    contrasena_responsable,
    contrasena_responsable_conf
  } = req.body;

  if (contrasena !== confirmar_contrasena) {
    return res.status(400).json({ error: 'Las contraseñas del empleado no coinciden' });
  }

  if (contrasena_responsable !== contrasena_responsable_conf) {
    return res.status(400).json({ error: 'Las contraseñas del gerente no coinciden' });
  }

  try {
    const conn = await pool.getConnection();

    // Verificar gerente
    const [gerenteRows] = await conn.execute(
      'SELECT * FROM empleados WHERE cargo = "Gerente" AND activo = 1 LIMIT 1'
    );

    if (gerenteRows.length === 0) {
      conn.release();
      return res.status(401).json({ error: 'No hay gerente activo en el sistema' });
    }

    const gerente = gerenteRows[0];
    const validaGerente = await bcrypt.compare(contrasena_responsable, gerente.contrasena_hash);

    if (!validaGerente) {
      conn.release();
      return res.status(401).json({ error: 'Contraseña del gerente incorrecta' });
    }

    const campos = [
      'primer_nom = ?',
      'segundo_nom = ?',
      'primer_ap = ?',
      'segundo_ap = ?',
      'correo = ?',
      'telefono = ?'
    ];

    const values = [
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      email,
      telefono
    ];

    if (contrasena) {
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      campos.push('contrasena_hash = ?');
      values.push(contrasenaHash);
    }

    values.push(username);

    const query = `UPDATE empleados SET ${campos.join(', ')} WHERE username = ? AND activo = 1`;

    const [result] = await conn.execute(query, values);
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Empleado no encontrado o inactivo' });
    }

    res.json({ mensaje: 'Empleado actualizado exitosamente' });

  } catch (err) {
    console.error(err);
    // Manejo específico de duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage && err.sqlMessage.includes('correo')) {
        return res.status(409).json({ error: 'El correo ya está registrado.' });
      } else if (err.sqlMessage && err.sqlMessage.includes('telefono')) {
        return res.status(409).json({ error: 'El teléfono ya está registrado.' });
      } else {
        return res.status(409).json({ error: 'El dato ya está registrado.' });
      }
    }
    res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
});

//Dar de baja empleado
app.put('/api/empleados/:username/baja', async (req, res) => {
  const { username } = req.params;
  const [result] = await pool.execute(
    'UPDATE empleados SET activo = 0 WHERE username = ?',
    [username]
  );

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
  res.json({ mensaje: 'Empleado dado de baja' });
});

//Dar de alta empleado (reactivar)
app.put('/api/empleados/:username/alta', async (req, res) => {
  const { username } = req.params;
  const { contrasena_responsable, contrasena_responsable_conf } = req.body;

  if (contrasena_responsable !== contrasena_responsable_conf) {
    return res.status(400).json({ error: 'Las contraseñas del responsable no coinciden' });
  }

  const conn = await pool.getConnection();
  try {
    // Verificar gerente
    const [gerenteRows] = await conn.execute(
      'SELECT * FROM empleados WHERE cargo = "Gerente" AND activo = 1 LIMIT 1'
    );

    if (gerenteRows.length === 0) {
      return res.status(401).json({ error: 'No hay gerente activo en el sistema' });
    }

    const gerente = gerenteRows[0];
    const validaGerente = await bcrypt.compare(contrasena_responsable, gerente.contrasena_hash);

    if (!validaGerente) {
      return res.status(401).json({ error: 'Contraseña del gerente incorrecta' });
    }

    // Verificar si el empleado existe y está inactivo
    const [empleadoRows] = await conn.execute(
      'SELECT * FROM empleados WHERE username = ? AND activo = 0',
      [username]
    );

    if (empleadoRows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado o ya está activo' });
    }

    // Reactivar empleado
    const [result] = await conn.execute(
      'UPDATE empleados SET activo = 1 WHERE username = ?',
      [username]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Error al reactivar el empleado' });
    }

    res.json({ 
      mensaje: 'Empleado reactivado exitosamente',
      success: true 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el proceso de reactivación' });
  } finally {
    conn.release();
  }
});



// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});


// // RUTA 404 - debe ir al final
// app.use((req, res) => {
//   // Si la petición viene de fetch o es JSON, responde con JSON de error
//   if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//     res.status(404).json({ error: 'Recurso no encontrado' });
//   } else {
//     // Si es navegación normal, devuelve la página 404
//     res.status(404).sendFile(path.join(__dirname, 'pages', 'configuracion', '404.html'));
//   }
// });

app.get('/api/cajero-sesion', (req, res) => {
  if (req.session.usuario) {
    res.json({ success: true, empleado: req.session.usuario });
  } else {
    res.json({ success: false });
  }
});

// Rutas para la configuración de la tienda
app.get('/api/configuracion', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion_tienda LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

app.post('/api/configuracion', async (req, res) => {
  try {
    console.log('Datos recibidos en el servidor:', req.body); // Debug
    console.log('Archivos recibidos:', req.files); // Debug

    const { nombre, direccion, telefono, rfc } = req.body;
    
    // Validar que los datos requeridos no sean nulos o vacíos
    if (!nombre || !direccion || !telefono || !rfc) {
      console.log('Datos faltantes:', { nombre, direccion, telefono, rfc }); // Debug
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    let logo = null;
    // Manejar el logo si se envió un archivo
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo;
      const logoPath = `/logos/${Date.now()}-${logoFile.name}`;
      await logoFile.mv(path.join(__dirname, 'public', logoPath));
      logo = logoPath;
    }

    // Verificar si ya existe una configuración
    const [existing] = await pool.query('SELECT * FROM configuracion_tienda LIMIT 1');

    if (existing.length > 0) {
      // Actualizar configuración existente
      const updateQuery = `
        UPDATE configuracion_tienda 
        SET nombre = ?,
            direccion = ?,
            telefono = ?,
            rfc = ?,
            logo = COALESCE(?, logo),
            updated_at = NOW()
        WHERE id = ?
      `;
      const updateValues = [nombre, direccion, telefono, rfc, logo, existing[0].id];
      console.log('Query de actualización:', updateQuery); // Debug
      console.log('Valores de actualización:', updateValues); // Debug
      
      await pool.query(updateQuery, updateValues);
    } else {
      // Insertar nueva configuración
      const insertQuery = `
        INSERT INTO configuracion_tienda 
        (nombre, direccion, telefono, rfc, logo, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const insertValues = [nombre, direccion, telefono, rfc, logo];
      console.log('Query de inserción:', insertQuery); // Debug
      console.log('Valores de inserción:', insertValues); // Debug
      
      await pool.query(insertQuery, insertValues);
    }

    // Obtener la configuración actualizada
    const [configuracion] = await pool.query('SELECT * FROM configuracion_tienda LIMIT 1');
    console.log('Configuración guardada:', configuracion[0]); // Debug
    
    res.json({ 
      success: true,
      message: 'Configuración guardada exitosamente',
      configuracion: configuracion[0]
    });
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    res.status(500).json({ error: 'Error al guardar la configuración' });
  }
});

// Ruta para verificar la estructura de la tabla
app.get('/api/verificar-configuracion', async (req, res) => {
  try {
    // Obtener la estructura de la tabla
    const [estructura] = await pool.query('DESCRIBE configuracion_tienda');
    console.log('Estructura de la tabla:', estructura);

    // Obtener los datos actuales
    const [datos] = await pool.query('SELECT * FROM configuracion_tienda');
    console.log('Datos en la tabla:', datos);

    res.json({
      estructura: estructura,
      datos: datos
    });
  } catch (error) {
    console.error('Error al verificar la tabla:', error);
    res.status(500).json({ error: 'Error al verificar la tabla' });
  }
});

// Endpoint para obtener información del usuario actual
app.get('/api/usuario-actual', (req, res) => {
    if (req.session.usuario) {
        res.json({
            cargo: req.session.usuario.cargo,
            nombre: req.session.usuario.nombre
        });
    } else {
        res.status(401).json({ error: 'No hay sesión activa' });
    }
});

// Ruta para verificar si existe entrada registrada
app.get('/api/verificar-entrada/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username es requerido' });

    try {
        // Buscar el id_empleado por username
        const [rows] = await pool.query('SELECT id_empleado FROM empleados WHERE username = ? AND activo = 1', [username]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        const id_empleado = rows[0].id_empleado;

        // Verificar si existe una entrada registrada hoy
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`;

        const [asistencias] = await pool.query(
            `SELECT id_asistencia FROM asistencia WHERE id_empleado = ? AND tipo = 'Entrada' AND DATE(fecha_hora) = ?`,
            [id_empleado, fechaHoy]
        );

        res.json({ tieneEntrada: asistencias.length > 0 });
    } catch (err) {
        console.error('Error al verificar entrada:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
