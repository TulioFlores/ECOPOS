document.addEventListener('DOMContentLoaded', () => {
    const cajeroInfo = JSON.parse(localStorage.getItem('cajero'));
    if (cajeroInfo) {
      document.getElementById('cajero').value = cajeroInfo.username;
      document.getElementById('nombre-empleado').value = cajeroInfo.nombre;
    } else {
      alert('No se encontró sesión del cajero');
    }
  });
  