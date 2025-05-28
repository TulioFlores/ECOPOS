// Función para mostrar mensajes dentro del modal de autenticación de corte
function mostrarMensajeCorteCajero(mensaje, esError = true) {
    let div = document.getElementById('mensajeCorteCajero');
    if (!div) {
        div = document.createElement('div');
        div.id = 'mensajeCorteCajero';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        div.style.marginTop = '10px';
        div.style.color = esError ? 'red' : 'green';
        const modalBody = document.querySelector('#modal-autenticacion-corte .modal-body');
        if (modalBody) {
            modalBody.appendChild(div);
        }
    }
    div.textContent = mensaje;
    div.style.color = esError ? 'red' : 'green';
}

function limpiarMensajeCorteCajero() {
    const div = document.getElementById('mensajeCorteCajero');
    if (div) div.textContent = '';
}

document.getElementById('form-autenticacion-corte').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const usuario = document.getElementById('usuarioCorte').value;
    const contrasena = document.getElementById('contrasenaCorte').value;
  
    try {
      const res = await fetch('http://localhost:3000/autenticar-cajero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
      });
  
      const data = await res.json();
  
      if (data.success) {
        limpiarMensajeCorteCajero();
        // Cerrar el modal de autenticación si está abierto
        const modalAutenticacion = bootstrap.Modal.getInstance(document.getElementById('modal-autenticacion-corte'));
        if (modalAutenticacion) modalAutenticacion.hide();
        // Abrir el modal de corte por cajero
        const modalCorte = new bootstrap.Modal(document.getElementById('modal-corte-cajero'));
        modalCorte.show();
      } else {
        mostrarMensajeCorteCajero(data.error || 'Error al autenticar', true);
      }
  
  
    } catch (error) {
      console.error('Error en la autenticación', error);
      mostrarMensajeCorteCajero('Error de conexión', true);
    }
  });


  document.getElementById('empleadoInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const username = e.target.value.trim();
  
      if (!username) {
        alert('Ingresa un nombre de usuario válido');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:3000/resumen-turno', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username })
        });
  
        const data = await response.json();
  
        if (data.error) {
          alert(data.error);
          return;
        }

        // Guardar el ID del empleado en una cookie
        document.cookie = `id_empleado=${data.id_empleado}; path=/; max-age=86400`; // Expira en 24 horas
  
        // Asegura que los valores sean números antes de usar toFixed
        const efectivo = Number(data.efectivo) || 0;
        const tarjeta = Number(data.tarjeta) || 0;
        const mp = Number(data.mercado_pago) || 0;
        const retiros = Number(data.retiros) || 0;
        const total = Number(data.total_venta) || 0;
  
        // Asignar a los inputs
        document.getElementById('efectivoSistema').value = efectivo.toFixed(2);
        document.getElementById('tarjetaSistema').value = tarjeta.toFixed(2);
        document.getElementById('mpSistema').value = mp.toFixed(2);
        document.getElementById('retiros').value = retiros.toFixed(2);
        document.getElementById('totalSistema').value = total.toFixed(2);
  
      } catch (error) {
        console.error(error);
        alert('Error al obtener el resumen del turno');
      }
    }
  });
  
 
document.addEventListener('DOMContentLoaded', () => {
  const campos = ['efectivo', 'tarjeta', 'mp'];

  campos.forEach(campo => {
    const input = document.getElementById(`${campo}Captura`);
    input.addEventListener('input', actualizarTotalCapturaYComparar);
  });

  function actualizarTotalCapturaYComparar() {
    let totalCaptura = 0;
    let totalSistema = 0;

    campos.forEach(campo => {
      const valorCaptura = parseFloat(document.getElementById(`${campo}Captura`).value) || 0;
      const valorSistema = parseFloat(document.getElementById(`${campo}Sistema`).value) || 0;
      totalCaptura += valorCaptura;
      totalSistema += valorSistema;
    });

    document.getElementById('totalCaptura').value = totalCaptura.toFixed(2);
    document.getElementById('totalSistema').value = totalSistema.toFixed(2);

    const diferencia = (totalSistema - totalCaptura).toFixed(2);
    const mensajeDiv = document.getElementById('mensajeFaltante');

    if (diferencia == 0) {
      mensajeDiv.textContent = '✅ Cuadre exacto. No hay diferencias.';
      mensajeDiv.style.color = 'green';
    } else if (diferencia > 0) {
      mensajeDiv.textContent = `💸 Faltante de: $${diferencia}`;
      mensajeDiv.style.color = 'red';
    } else {
      mensajeDiv.textContent = `💰 Sobrante de: $${Math.abs(diferencia).toFixed(2)}`;
      mensajeDiv.style.color = 'orange';
    }
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const btnCierre = document.getElementById('aplicar-cierre');
  const mensajeModal = document.getElementById('mensajeModalCierre');
  const modalCierre = new bootstrap.Modal(document.getElementById('modalCierre'));

  btnCierre.addEventListener('click', () => {
    const totalSistema = parseFloat(document.getElementById('totalSistema').value) || 0;
    const totalCaptura = parseFloat(document.getElementById('totalCaptura').value) || 0;
    const diferencia = (totalSistema - totalCaptura).toFixed(2);

    if (diferencia == 0) {
      mensajeModal.innerHTML = "¿Estás seguro de aplicar el cierre? Esta acción no se puede deshacer.";
    } else if (diferencia > 0) {
      mensajeModal.innerHTML = `⚠️ Hay un <strong>faltante</strong> de <strong>$${diferencia}</strong>. ¿Deseas continuar? Esta acción no se puede revertir.`;
    } else {
      mensajeModal.innerHTML = `⚠️ Hay un <strong>sobrante</strong> de <strong>$${Math.abs(diferencia).toFixed(2)}</strong>. ¿Deseas continuar? Esta acción no se puede revertir.`;
    }

    modalCierre.show();
  });

  document.getElementById('confirmarCierreBtn').addEventListener('click', async () => {
    const totalSistema = parseFloat(document.getElementById('totalSistema').value) || 0;
    const totalCaptura = parseFloat(document.getElementById('totalCaptura').value) || 0;
    const diferencia = totalSistema - totalCaptura;
  
    const faltante = diferencia > 0 ? diferencia.toFixed(2) : 0;
    const sobrante = diferencia < 0 ? Math.abs(diferencia).toFixed(2) : 0;
    const montoCorrecto = totalSistema;
  
    // Obtener el ID del empleado de la cookie
    const id_empleado = obtenerIdEmpleado();
    if (!id_empleado) {
      alert('Error: No se encontró la sesión del empleado');
      return;
    }

    try {
      const res = await fetch('/api/aplicar-cierre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_empleado, faltante, sobrante, montoCorrecto })
      });
  
      const result = await res.json();
      if (result.success) {
        alert('Cierre registrado correctamente.');
        modalCierre.hide();
        const modalElement = document.getElementById('modal-corte-cajero');
        const modalCorte = bootstrap.Modal.getInstance(modalElement);
        modalCorte.hide();
        
        // Eliminar la cookie después del cierre exitoso
        eliminarCookieEmpleado();
        
        // Redirección según el cargo en sesión
        try {
          const res = await fetch('http://localhost:3000/api/cajero-sesion', { credentials: 'include' });
          const data = await res.json();
          if (data.success && data.empleado && data.empleado.cargo === 'Gerente') {
            window.location.href = '/reportes';
          } else {
            window.location.href = '/reportes-emp';
          }
        } catch (e) {
          window.location.href = '/reportes-emp';
        }
      } else {
        alert('Error al registrar el cierre.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error en la conexión con el servidor.');
    }
  });
});

// Función para obtener el ID del empleado de la cookie
function obtenerIdEmpleado() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'id_empleado') {
      return value;
    }
  }
  return null;
}

// Función para eliminar la cookie del empleado
function eliminarCookieEmpleado() {
  document.cookie = 'id_empleado=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
