document.addEventListener("DOMContentLoaded", function () {
    //Funcion para salir
    document.getElementById("Salir").addEventListener("click", async () => {
        try {
          const response = await fetch("http://localhost:3000/logout", {
            method: "POST",
            credentials: "include" // Incluye la cookie de sesión
          });

          if (response.ok) {
            // Redirige al inicio (ajusta si tu página de inicio es distinta)
            window.location.href = "/";
          } else {
            alert("Error al cerrar sesión");
          }
        } catch (error) {
          console.error("Error en logout:", error);
          alert("No se pudo cerrar sesión");
        }
    });

    // Función para cerrar el sidebar
    function cerrarSidebar() {
        const sidebar = document.getElementById('sidebar');
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebar);
        if (bsOffcanvas) {
            bsOffcanvas.hide();
        }
    }

    // Función para resaltar el botón activo
    function resaltarActivo(id) {
        // Remover clase activa de todos los botones
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        // Agregar clase activa al botón seleccionado
        const boton = document.getElementById(id);
        if (boton) {
            boton.classList.add('active');
        }
    }

    // Obtener la ruta actual
    const currentPath = window.location.pathname;

    // Resaltar el botón correspondiente según la ruta
    if (currentPath.includes("reportes")) resaltarActivo("boton-cierre-del-dia");
    if (currentPath.includes("captura")) resaltarActivo("abrirCapturaVenta");

    // Autenticación para Captura de Venta
    const formAccesoVenta = document.getElementById('formAccesoVenta');
    if (formAccesoVenta) {
        formAccesoVenta.addEventListener('submit', async function(e) {
            e.preventDefault();
            const usuario = document.getElementById('usuarioVenta').value.trim();
            const contrasena = document.getElementById('contrasenaVenta').value;
            if (!usuario || !contrasena) {
                alert('Por favor, ingresa usuario y contraseña');
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/abrir-captura-venta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ usuario, contrasena })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    window.location.href = '/pointofsale';
                } else {
                    alert(data.error || 'Error al abrir captura');
                }
            } catch (error) {
                console.error('Error al conectar con el servidor:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }
}); 