document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/abrir-captura-venta', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    if (response.ok && data.success && data.empleado) {
      document.getElementById('cajero').value = data.empleado.username;
      document.getElementById('nombre-empleado').value = data.empleado.nombre;
    } else {
      // Si no hay sesión activa, redirigir o mostrar error
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error al obtener datos del cajero:', error);
    window.location.href = '/login';
  }
});

  