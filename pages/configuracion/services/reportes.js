

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