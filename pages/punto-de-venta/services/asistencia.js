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

// Función para limpiar el formulario
function limpiarFormularioAsistencia() {
    document.getElementById('numEmpleado').value = '';
    document.getElementById('nombreEmpleado').value = '';
    document.getElementById('apellidoP').value = '';
    document.getElementById('apellidoM').value = '';
    document.getElementById('tipoAsistencia').value = 'Entrada';
    limpiarMensajeAsistencia();
}

// Función para verificar si existe entrada registrada
async function verificarEntradaRegistrada(username) {
    try {
        const response = await fetch(`/api/verificar-entrada/${username}`);
        const data = await response.json();
        return data.tieneEntrada;
    } catch (error) {
        console.error('Error al verificar entrada:', error);
        return false;
    }
}

// Función para validar el tipo de asistencia
async function validarTipoAsistencia(username, tipo) {
    if (tipo === 'Salida') {
        const tieneEntrada = await verificarEntradaRegistrada(username);
        if (!tieneEntrada) {
            mostrarMensajeAsistencia('No se puede registrar salida sin haber registrado entrada previamente', true);
            return false;
        }
    }
    return true;
}

// Agregar evento para limpiar el formulario cuando se cierra el modal
document.getElementById('modalAsistencia').addEventListener('hidden.bs.modal', function () {
    limpiarFormularioAsistencia();
});

document.getElementById('registrar').addEventListener('click', async () => {
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

    // Validar tipo de asistencia
    const esValido = await validarTipoAsistencia(username, tipo);
    if (!esValido) return;

    // Envío al servidor
    try {
        const response = await fetch('http://localhost:3000/registrar-asistencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, tipo })
        });

        const data = await response.json();
        
        if (data.error) {
            mostrarMensajeAsistencia(data.error, true);
        } else {
            mostrarMensajeAsistencia(data.mensaje || 'Asistencia registrada', false);
            // Cerrar el modal después de registro exitoso
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAsistencia'));
            if (modal) {
                modal.hide();
            }
        }
    } catch (err) {
        console.error('Error al registrar:', err);
        mostrarMensajeAsistencia('Error al registrar la asistencia', true);
    }
});

// Actualizar el select de tipo de asistencia cuando cambia el usuario
document.getElementById('numEmpleado').addEventListener('input', async function() {
    const username = this.value.trim();
    if (username) {
        const tieneEntrada = await verificarEntradaRegistrada(username);
        const selectTipo = document.getElementById('tipoAsistencia');
        
        // Si no tiene entrada, deshabilitar la opción de salida
        if (!tieneEntrada) {
            selectTipo.value = 'Entrada';
            selectTipo.querySelector('option[value="Salida"]').disabled = true;
        } else {
            selectTipo.querySelector('option[value="Salida"]').disabled = false;
        }
    } else {
        // Si el campo está vacío, habilitar ambas opciones
        const selectTipo = document.getElementById('tipoAsistencia');
        selectTipo.querySelector('option[value="Salida"]').disabled = false;
    }
});