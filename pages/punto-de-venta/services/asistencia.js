// Autocompletar nombre y apellidos al ingresar el usuario
async function autocompletarEmpleadoPorUsuario() {
    const username = document.getElementById('numEmpleado').value.trim();
    if (!username) return;

    try {
        const res = await fetch(`/api/empleados/${username}`);
        const empleado = await res.json();

        if (empleado && !empleado.error && !empleado.mensaje) {
            document.getElementById('nombreEmpleado').value = empleado.primer_nom || '';
            document.getElementById('apellidoP').value = empleado.primer_ap || '';
            document.getElementById('apellidoM').value = empleado.segundo_ap || '';
        } else {
            mostrarMensajeAsistencia('Empleado no encontrado', true);
            document.getElementById('nombreEmpleado').value = '';
            document.getElementById('apellidoP').value = '';
            document.getElementById('apellidoM').value = '';
        }
    } catch (error) {
        mostrarMensajeAsistencia('Error al buscar empleado', true);
    }
}

document.getElementById('numEmpleado').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        autocompletarEmpleadoPorUsuario();
    }
});

// Función para mostrar mensajes debajo del formulario
definirMensajeAsistencia();
function mostrarMensajeAsistencia(mensaje, esError = false) {
    const div = document.getElementById('mensajeAsistencia');
    div.textContent = mensaje;
    div.style.color = esError ? 'red' : 'green';
    div.style.marginTop = '10px';
}

function limpiarMensajeAsistencia() {
    const div = document.getElementById('mensajeAsistencia');
    div.textContent = '';
}

function definirMensajeAsistencia() {
    if (!document.getElementById('mensajeAsistencia')) {
        const div = document.createElement('div');
        div.id = 'mensajeAsistencia';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        // Insertar el mensaje dentro del modal, antes del footer
        const modalBody = document.querySelector('#modalAsistencia .modal-body');
        const modalFooter = document.querySelector('#modalAsistencia .modal-footer');
        if (modalBody && modalFooter) {
            modalBody.appendChild(div);
        } else {
            document.body.appendChild(div);
        }
    }
}

document.getElementById('registrar').addEventListener('click', () => {
    const username = document.getElementById('numEmpleado').value.trim();
    const nombre = document.getElementById('nombreEmpleado').value.trim();
    const apellidoP = document.getElementById('apellidoP').value.trim();
    const apellidoM = document.getElementById('apellidoM').value.trim();
    const tipo = document.getElementById('tipoAsistencia').value;

    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    limpiarMensajeAsistencia();

    // Validación de campos
    if (!username || !nombre || !apellidoP || !apellidoM ||
        !soloLetras.test(nombre) || !soloLetras.test(apellidoP) || !soloLetras.test(apellidoM)) {
        mostrarMensajeAsistencia("Formulario incompleto o inválido. Verifica que los nombres y apellidos contengan solo letras.", true);
        return;
    }

    // Envío al servidor
    fetch('http://localhost:3000/registrar-asistencia', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, tipo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            mostrarMensajeAsistencia(data.error, true);
        } else {
            mostrarMensajeAsistencia(data.mensaje || 'Asistencia registrada', false);
        }
    })
    .catch(err => {
        console.error('Error al registrar:', err);
        mostrarMensajeAsistencia('Error al registrar la asistencia', true);
    });
});