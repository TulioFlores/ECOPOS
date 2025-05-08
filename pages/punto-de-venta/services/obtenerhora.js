async function obtenerHoraServidor() {
  try {
    const response = await fetch('http://localhost:3000/hora-servidor');
    const data = await response.json();

    // Actualiza todos los elementos con clase "fecha"
    document.querySelectorAll('.fecha').forEach(el => {
      el.textContent = data.fecha;
    });

    // Actualiza todos los elementos con clase "hora"
    document.querySelectorAll('.hora').forEach(el => {
      el.textContent = data.hora;
    });

  } catch (err) {
    console.error('Error al obtener la hora del servidor:', err);
  }
}


  obtenerHoraServidor();          // Al cargar la página
  setInterval(obtenerHoraServidor, 1000);  // Actualiza cada segundo