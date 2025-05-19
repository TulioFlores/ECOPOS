
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



// Evento para abrir el modal para login local de captura de venta

document.getElementById('abrirCapturaVenta').addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/abrir-captura-venta', {
      method: 'GET',
      credentials: 'include' // para enviar la cookie de sesión
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Guarda en localStorage si quieres
      localStorage.setItem('cajero', JSON.stringify(data.empleado));
      
      // Redirige al punto de venta
      window.location.href = '/pointofsale';
    } else {
      alert(data.error || 'Error al abrir captura');
    }
  } catch (error) {
    console.error('Error al conectar con el servidor:', error);
    alert('Error al conectar con el servidor');
  }
});


  const currentPath = window.location.pathname;
  
function resaltarActivo(id) {
  const link = document.getElementById(id);

  const estaResaltado = link.classList.contains("bg-white") && link.classList.contains("text-black");

  // Si ya está resaltado, lo desmarca
  if (estaResaltado) {
    link.classList.remove("bg-white", "text-black", "fw-bold", "px-3", "py-2", "rounded-3", "shadow-sm");
    link.classList.add("text-white");
  } else {
    // Desmarcar todos los otros botones activos
    const botonesResaltados = document.querySelectorAll(".bg-white.text-black");
    botonesResaltados.forEach(boton => {
      boton.classList.remove("bg-white", "text-black", "fw-bold", "px-3", "py-2", "rounded-3", "shadow-sm");
      boton.classList.add("text-white");
    });

    // Marcar el actual
    link.classList.remove("text-white");
    link.classList.add("bg-white", "text-black", "fw-bold", "px-3", "py-2", "rounded-3", "shadow-sm");
  }
}



  
  if (currentPath.includes("captura")) resaltarActivo("abrirCapturaVenta");
  if (currentPath === ("/reportes")) resaltarActivo("linkConfig");


