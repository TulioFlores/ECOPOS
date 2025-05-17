document.addEventListener('DOMContentLoaded', () => {
  const cajeroInfo = JSON.parse(localStorage.getItem('cajero'));

  // if (!cajeroInfo) {
  //   // Redirige si no hay sesión
  //   // window.location.href = '/configuracion';
  // } else {
    // Si existe sesión, puedes cargar los datos
    document.getElementById('cajero').value = cajeroInfo.username;
    document.getElementById('nombre-empleado').value = cajeroInfo.nombre;
  
});

  