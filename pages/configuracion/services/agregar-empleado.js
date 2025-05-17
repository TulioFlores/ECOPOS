document.getElementById('form-empleado').addEventListener('submit', async function (e) {
  e.preventDefault();

  const primer_nombre = document.getElementById('primer-nombre').value.trim();
  const segundo_nombre = document.getElementById('segundo-nombre').value.trim();
  const primer_apellido = document.getElementById('primer-apellido').value.trim();
  const segundo_apellido = document.getElementById('segundo-apellido').value.trim();
  const correo = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const puesto = document.getElementById('puesto').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const confirmar_contrasena = document.getElementById('confirmar-contrasena').value;
  const contrasena_responsable = document.getElementById('contrasena-responsable').value;
  const contrasena_responsable_conf = document.getElementById('contrasena-responsable-conf').value;

  // Validaciones básicas
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telRegex = /^[0-9]{10}$/;

  if (!primer_nombre || !primer_apellido || !correo || !telefono || !contrasena || !confirmar_contrasena || !contrasena_responsable || !contrasena_responsable_conf) {
    mostrarModal('❌ Por favor, completa todos los campos obligatorios.');
    return;
  }

  if (!emailRegex.test(correo)) {
    mostrarModal('❌ El correo electrónico no es válido.');
    return;
  }

  if (!telRegex.test(telefono)) {
    mostrarModal('❌ El teléfono debe contener exactamente 10 dígitos.');
    return;
  }

  if (contrasena !== confirmar_contrasena) {
    mostrarModal('❌ Las contraseñas del empleado no coinciden.');
    return;
  }

  if (contrasena_responsable !== contrasena_responsable_conf) {
    mostrarModal('❌ Las contraseñas del responsable no coinciden.');
    return;
  }

  const data = {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    correo,
    telefono,
    puesto,
    contrasena,
    contrasena_responsable, 
    contrasena_responsable_conf, 
  };

  try {
    const res = await fetch('http://localhost:3000/altaempleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if ( result.success) {
      const nombre = `${primer_nombre} ${primer_apellido}`;
      mostrarModal(`✅ Se agregó correctamente al empleado: <strong>${nombre} con el nombre de usuario ${result.username}</strong> `);
      document.getElementById('form-empleado').reset();
    } else {
      mostrarModal(`❌ ${result.error || 'Error al registrar al empleado.'}`);
    }
  } catch (error) {
    console.error(error);
    mostrarModal('❌ Fallo en la conexión con el servidor.');
  }
});

// Función auxiliar para mostrar mensajes
function mostrarModal(mensaje) {
  // Puedes adaptarlo según tu sistema de modales
  alert(mensaje); // Cambia esto si ya tienes un modal visual
}
  function mostrarModal(mensaje) {
    const modalBody = document.getElementById('modalMensajeBody');
    modalBody.innerHTML = mensaje;
  
    const modal = new bootstrap.Modal(document.getElementById('modalMensaje'));
    modal.show();
  }
  
  
