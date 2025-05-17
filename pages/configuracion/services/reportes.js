

// Referencias a todos los modales
const modalVentaPorDia = document.getElementById("venta-por-dia");
const modalVentaPorEmpleado = document.getElementById("venta-por-empleado");
const modalEmpleado = document.getElementById("alta-empleado");
const modalProducto = document.getElementById("agregar-producto");

// Botones
const btnAbrirVentaPorDia = document.getElementById("boton-venta-por-dia");
const btnAbrirVentaPorEmpleado = document.getElementById("boton-venta-por-empleado");
const btnAbrirEmpleado = document.getElementById("abrir-empleado");
const btnAbrirProducto = document.getElementById("boton-agregar-producto");
// Botones cancelar/confirmar del modal de empleado
const btnCancelarEmpleado = document.getElementById("btn-cancelar-empleado");
const btnConfirmarEmpleado = document.getElementById("btn-confirmar-empleado");

// Función para cerrar todos los modales
function cerrarTodosLosModales() {
    modalVentaPorDia.style.display = "none";
    modalVentaPorEmpleado.style.display = "none";
    modalEmpleado.style.display = "none";
    modalProducto.style.display = "none";
}

// Abrir modal de Venta por Día
btnAbrirVentaPorDia.addEventListener("click", () => {
    const yaVisible = modalVentaPorDia.style.display === "flex";
    cerrarTodosLosModales();
    if (!yaVisible) modalVentaPorDia.style.display = "flex";
});

// Abrir modal de Venta por Empleado
btnAbrirVentaPorEmpleado.addEventListener("click", () => {
    const yaVisible = modalVentaPorEmpleado.style.display === "flex";
    cerrarTodosLosModales();
    if (!yaVisible) modalVentaPorEmpleado.style.display = "flex";
});

// Abrir modal de Alta de Empleado
btnAbrirEmpleado.addEventListener("click", () => {
    const yaVisible = modalEmpleado.style.display === "flex";
    cerrarTodosLosModales();
    if (!yaVisible) modalEmpleado.style.display = "flex";
});
// Abrir modal de Alta de Producto
btnAbrirProducto.addEventListener("click", () => {
    const yaVisible = modalProducto.style.display === "flex";
    cerrarTodosLosModales();
    if (!yaVisible) modalProducto.style.display = "flex";
});

// También cierra el modal si se presiona Cancelar o Confirmar
btnCancelarEmpleado.addEventListener("click", () => {
    modalEmpleado.style.display = "none";
    document.querySelector('form').reset();
});


// Evento para abrir el modal para login local de captura de venta

document.getElementById('abrirCapturaVenta').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalAccesoVenta'));
    modal.show();
  });

  document.getElementById('formAccesoVenta').addEventListener('submit', async function (e) {
    e.preventDefault();

    const usuario = document.getElementById('usuarioVenta').value.trim();
    const contrasena = document.getElementById('contrasenaVenta').value;

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: usuario, contrasena: contrasena })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Guarda los datos del cajero en localStorage
        localStorage.setItem('cajero', JSON.stringify({
          id: data.empleado.id_empleado,
          username: data.empleado.username,
          nombre: data.empleado.nombre_completo
        }));
      
        // Redirige al punto de venta
        window.location.href = '/pointofsale';
      }else {
        alert(data.error || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor');
    }
  });

  const currentPath = window.location.pathname;

  function resaltarActivo(id) {
      const link = document.getElementById(id);
      link.classList.remove("text-white");
      link.classList.add("bg-white", "text-black", "fw-bold", "px-3", "py-2", "rounded-3", "shadow-sm");
  }
  
  if (currentPath.includes("captura")) resaltarActivo("abrirCapturaVenta");
  if (currentPath === "/configuracion/") resaltarActivo("linkConfig");
  if (currentPath === "/reportes") resaltarActivo("linkReportes");
  if (currentPath === "/pages/punto-de-venta/pointofsale.html") resaltarActivo("linkChecador");


  //Boton para ver la venta por dia
  document.getElementById('btn-buscar-ventas').addEventListener('click', () => {
  const inicio = document.getElementById('fecha-inicio').value;
  const fin = document.getElementById('fecha-fin').value;

  if (!inicio || !fin) {
    alert('Por favor selecciona ambas fechas.');
    return;
  }

  fetch(`/api/ventas/resumen-intervalo?inicio=${inicio}&fin=${fin}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('efectivo-dia').value = parseFloat(data.total_efectivo).toFixed(2);
      document.getElementById('tarjeta-dia').value = parseFloat(data.total_tarjeta).toFixed(2);
      document.getElementById('mp-dia').value = parseFloat(data.total_mercado_pago).toFixed(2);
      document.getElementById('total-dia').value = parseFloat(data.total_general).toFixed(2);
    })
    .catch(error => {
      console.error('Error al obtener resumen:', error);
      alert('Error al buscar ventas. Revisa la consola.');
    });
});
//Ventas por intervalo y por empleado
document.getElementById('btn-buscar-empleado').addEventListener('click', async () => {
  const username = document.getElementById('usuario-empleado').value.trim();
  const fechaInicio = document.getElementById('fecha-inicio-empleado').value;
  const fechaFin = document.getElementById('fecha-fin-empleado').value;

  if (!username || !fechaInicio || !fechaFin) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  try {
    const res = await fetch('/por-empleado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inicio: fechaInicio,
        fin: fechaFin,
        username: username
      })
    });

    const data = await res.json();

    if (data.success) {
      const d = data.datos;
      document.getElementById('efectivo-empleado').value = d.total_efectivo || 0;
      document.getElementById('tarjeta-empleado').value = d.total_tarjeta || 0;
      document.getElementById('mp-empleado').value = d.total_mercado_pago || 0;
      document.getElementById('total-empleado').value = d.total_general || 0;
    } else {
      alert('No se pudo obtener el resumen.');
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    alert('Error al obtener los datos');
  }
});
