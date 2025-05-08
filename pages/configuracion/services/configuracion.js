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