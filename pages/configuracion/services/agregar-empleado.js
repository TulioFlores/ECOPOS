document.getElementById('btn-confirmar-empleado').addEventListener('click', async function(e) {
    e.preventDefault();
  
    const contrasena = document.getElementById('contrasena').value;
    const confirmar_contrasena = document.getElementById('confirmar-contrasena').value;
  
    if (contrasena !== confirmar_contrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }
  
    const data = {
      primer_nombre: document.getElementById('primer-nombre').value.trim(),
      segundo_nombre: document.getElementById('segundo-nombre').value.trim(),
      primer_apellido: document.getElementById('primer-apellido').value.trim(),
      segundo_apellido: document.getElementById('segundo-apellido').value.trim(),
      correo: document.getElementById('email').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      puesto: document.getElementById('puesto').value.trim(),
      contrasena: contrasena,
      contrasena_responsable: document.getElementById('contrasena-responsable').value,
      contrasena_responsable_conf: document.getElementById('contrasena-responsable-conf').value
    };
  
    try {
      const res = await fetch('http://localhost:3000/altaempleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      const result = await res.json();
  
      if (res.ok) {
        const nombre = `${data.primer_nombre} ${data.primer_apellido}`;
        mostrarModal(`✅ Se agregó correctamente al empleado: <strong>${nombre}</strong>`);
        document.querySelector('form').reset();
      } else {
        mostrarModal(`❌ ${result.error || 'Error al registrar'}`);
      }
      
    } catch (error) {
      console.error(error);
      alert('Fallo en la conexión');
    }
  });

  function mostrarModal(mensaje) {
    const modalBody = document.getElementById('modalMensajeBody');
    modalBody.innerHTML = mensaje;
  
    const modal = new bootstrap.Modal(document.getElementById('modalMensaje'));
    modal.show();
  }
  
  
