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

  // Verificar si estamos reactivando un empleado existente
  const username = obtenerUsernameDesdeCookie();
  const esReactivacion = !!username;

  // Validaciones básicas
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]{2,50}$/;
  const contieneNoLetras = /[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]/;
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const telRegex = /^\d{10}$/;

  if (contieneNoLetras.test(primer_nombre)) {
    mostrarModal('❌ El primer nombre no puede contener números ni caracteres especiales.');
    return;
  }
  if (!soloLetras.test(primer_nombre)) {
    mostrarModal('❌ El primer nombre solo puede contener letras y debe tener al menos 2 caracteres.');
    return;
  }
  if (segundo_nombre && contieneNoLetras.test(segundo_nombre)) {
    mostrarModal('❌ El segundo nombre no puede contener números ni caracteres especiales.');
    return;
  }
  if (primer_apellido && contieneNoLetras.test(primer_apellido)) {
    mostrarModal('❌ El primer apellido no puede contener números ni caracteres especiales.');
    return;
  }
  if (!soloLetras.test(primer_apellido)) {
    mostrarModal('❌ El primer apellido solo puede contener letras y debe tener al menos 2 caracteres.');
    return;
  }
  if (segundo_apellido && contieneNoLetras.test(segundo_apellido)) {
    mostrarModal('❌ El segundo apellido no puede contener números ni caracteres especiales.');
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

  // Solo validar contraseñas si no es una reactivación
  if (!esReactivacion) {
    if (contrasena.length < 6) {
      mostrarModal('❌ La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== confirmar_contrasena) {
      mostrarModal('❌ Las contraseñas del empleado no coinciden.');
      return;
    }
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
    contrasena_responsable, 
    contrasena_responsable_conf, 
  };

  // Solo incluir contraseña del empleado si no es reactivación
  if (!esReactivacion) {
    data.contrasena = contrasena;
  }

  try {
    let endpoint = 'http://localhost:3000/altaempleados';
    let method = 'POST';

    if (esReactivacion) {
      endpoint = `/api/empleados/${username}/alta`;
      method = 'PUT';
      data.username = username;
    }

    const res = await fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success || result.mensaje) {
      const nombre = `${primer_nombre} ${primer_apellido}`;
      const mensaje = esReactivacion 
        ? `✅ Se reactivó correctamente al empleado: <strong>${nombre}</strong>`
        : `✅ Se agregó correctamente al empleado: <strong>${nombre} con el nombre de usuario ${result.username}</strong>`;
      
      mostrarModal(mensaje);
      document.getElementById('form-empleado').reset();
      document.getElementById('btn-baja-empleado').classList.add('d-none');
      document.cookie = 'empleado_username=; max-age=0; path=/';
    } else {
      // Manejo de errores de duplicate entry
      if (result.error && result.error.includes('correo')) {
        mostrarModal('❌ El correo ya está registrado.');
      } else if (result.error && result.error.includes('telefono')) {
        mostrarModal('❌ El teléfono ya está registrado.');
      } else if (result.error && result.error.includes('ER_DUP_ENTRY')) {
        if (result.error.includes('correo')) {
          mostrarModal('❌ El correo ya está registrado.');
        } else if (result.error.includes('telefono')) {
          mostrarModal('❌ El teléfono ya está registrado.');
        } else {
          mostrarModal('❌ El dato ya está registrado.');
        }
      } else {
        mostrarModal(`❌ ${result.error || 'Error al registrar al empleado.'}`);
      }
    }
  } catch (error) {
    console.error(error);
    mostrarModal('❌ Fallo en la conexión con el servidor.');
  }
});

// Función auxiliar para mostrar mensajes
// function mostrarModal(mensaje) {
//   // Puedes adaptarlo según tu sistema de modales
//   alert(mensaje); // Cambia esto si ya tienes un modal visual
// }
  function mostrarModal(mensaje) {
    const modalBody = document.getElementById('modalMensajeBody');
    modalBody.innerHTML = mensaje;
  
    const modal = new bootstrap.Modal(document.getElementById('modalMensaje'));
    modal.show();
  }
  

  //Buscar empleado
document.getElementById('btn-buscar-empleados').addEventListener('click', async () => {
  if (typeof mostrarPromptAsync !== 'function') {
    mostrarModal('No se encontró la función mostrarPromptAsync.');
    return;
  }
  const username = await mostrarPromptAsync({
    titulo: 'Buscar empleado',
    mensaje: 'Ingrese el username del empleado a buscar:',
    tipo: 'text',
    obligatorio: true
  });
  if (!username) return;

  const res = await fetch(`/api/empleados/${username}`);
  const empleado = await res.json();

  if (!empleado || empleado.error) {
    mostrarModal('❌ Empleado no encontrado');
    return;
  }

  // Llenar el formulario
  document.getElementById('primer-nombre').value = empleado.primer_nom;
  document.getElementById('segundo-nombre').value = empleado.segundo_nom;
  document.getElementById('primer-apellido').value = empleado.primer_ap;
  document.getElementById('segundo-apellido').value = empleado.segundo_ap;
  document.getElementById('email').value = empleado.correo;
  document.getElementById('telefono').value = empleado.telefono;

  // Guardar el username en cookie (expira en 5 minutos)
  document.cookie = `empleado_username=${username}; max-age=300; path=/`;
  // Mostrar botón de baja
  document.getElementById('btn-baja-empleado').classList.remove('d-none');
});

function obtenerUsernameDesdeCookie() {
  const match = document.cookie.match(/(?:^|; )empleado_username=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

  
document.getElementById('btn-modificar-empleado').addEventListener('click', async () => {
  const username = obtenerUsernameDesdeCookie();
  if (!username) {
    mostrarModal('❌ Primero debe buscar un empleado para modificar');
    return;
  }

  const datos = {
    primer_nombre: document.getElementById('primer-nombre').value,
    segundo_nombre: document.getElementById('segundo-nombre').value,
    primer_apellido: document.getElementById('primer-apellido').value,
    segundo_apellido: document.getElementById('segundo-apellido').value,
    email: document.getElementById('email').value,
    telefono: document.getElementById('telefono').value,
    contrasena: document.getElementById('contrasena').value,
    confirmar_contrasena: document.getElementById('confirmar-contrasena').value,
    contrasena_responsable: document.getElementById('contrasena-responsable').value,
    contrasena_responsable_conf: document.getElementById('contrasena-responsable-conf').value
  };

  const res = await fetch(`/api/empleados/${username}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });

  const resultado = await res.json();
  if (resultado.mensaje) {
    mostrarModal('✅ ' + resultado.mensaje);
    document.getElementById('form-empleado').reset();
    document.cookie = 'empleado_username=; max-age=0; path=/';
    document.getElementById('btn-baja-empleado').classList.add('d-none');
  } else if (resultado.error) {
    mostrarModal('❌ ' + resultado.error);
  } else {
    mostrarModal('❌ Error desconocido al modificar el empleado.');
  }
});



//Dar de baja
document.getElementById('btn-baja-empleado').addEventListener('click', async () => {
  const username = obtenerUsernameDesdeCookie();
  if (!username) {
    mostrarModal('❌ No se ha seleccionado un empleado');
    return;
  }

  // Confirmación visual con modal tipo prompt
  const confirmacion = await mostrarPromptAsync({
    titulo: 'Confirmar baja',
    mensaje: `¿Estás seguro de dar de baja al empleado ${username}? Escribe SI para confirmar.`,
    tipo: 'text',
    obligatorio: true
  });
  if (!confirmacion || confirmacion.toUpperCase() !== 'SI') {
    mostrarModal('Operación cancelada.');
    return;
  }

  const res = await fetch(`/api/empleados/${username}/baja`, {
    method: 'PUT'
  });

  const resultado = await res.json();
  mostrarModal(resultado.mensaje || resultado.error || 'Operación realizada.');

  // Limpiar formulario y cookie
  document.getElementById('form-empleado').reset();
  document.getElementById('btn-baja-empleado').classList.add('d-none');
  document.cookie = 'empleado_username=; max-age=0; path=/';
});


