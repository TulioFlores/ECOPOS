// Función para mostrar mensajes dentro del modal de retiro
function mostrarMensajeRetiro(mensaje, esError = true) {
    let div = document.getElementById('mensajeRetiro');
    if (!div) {
        div = document.createElement('div');
        div.id = 'mensajeRetiro';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        div.style.marginTop = '10px';
        div.style.color = esError ? 'red' : 'green';
        const modal = document.getElementById('retiro');
        if (modal) {
            modal.appendChild(div);
        }
    }
    div.textContent = mensaje;
    div.style.color = esError ? 'red' : 'green';
}

function limpiarMensajeRetiro() {
    const div = document.getElementById('mensajeRetiro');
    if (div) div.textContent = '';
}

document.getElementById('btn-confirmar-retiro').addEventListener('click', async () => {
    const cantidad = parseFloat(document.getElementById('cantidad-retiro').value);
    const motivo = document.getElementById('motivo-retiro').value.trim();
    const username = document.getElementById('cajero-retiro').value.trim();
    const contraseña = document.getElementById('contraseña-retiro').value;
    const confContraseña = document.getElementById('conf-contraseña-retiro').value;

    limpiarMensajeRetiro();

    // Validaciones básicas
    if (cantidad <= 0 || !motivo || !username || !contraseña || !confContraseña) {
        mostrarMensajeRetiro('Por favor completa todos los campos correctamente.', true);
        return;
    }
    if (contraseña !== confContraseña) {
        mostrarMensajeRetiro('Las contraseñas no coinciden.', true);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/retiros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad, motivo, username, contraseña })
        });

        const data = await response.json();
        if (response.ok) {
            mostrarMensajeRetiro('Retiro realizado con éxito.', false);
            // Opcional: limpiar inputs
            document.getElementById('retiro').querySelectorAll('input').forEach(i => i.value = '');
            // Cerrar el modal después de un breve tiempo
            setTimeout(() => {
                const modalRetiro = bootstrap.Modal.getInstance(document.getElementById('modalRetiro'));
                if (modalRetiro) modalRetiro.hide();
                limpiarMensajeRetiro();
            }, 1000);
        } else {
            mostrarMensajeRetiro(data.error || 'Error al realizar el retiro.', true);
        }
    } catch (error) {
        console.error('Error al enviar retiro:', error);
        mostrarMensajeRetiro('Fallo en la conexión con el servidor.', true);
    }
});

document.getElementById('btn-cancelar-retiro').addEventListener('click', () => {
    document.getElementById('retiro').querySelectorAll('input').forEach(i => i.value = '');
    limpiarMensajeRetiro();
});