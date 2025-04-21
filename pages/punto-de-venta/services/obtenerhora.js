async function obtenerHoraServidor() {
    try {
      const response = await fetch('http://localhost:3000/hora-servidor');
      const data = await response.json();
      document.getElementById('fecha').textContent = data.fecha;
      document.getElementById('hora').textContent = data.hora;
    } catch (err) {
      console.error('Error al obtener la hora del servidor:', err);
    }
  }

  obtenerHoraServidor();          // Al cargar la página
  setInterval(obtenerHoraServidor, 1000);  // Actualiza cada segundo