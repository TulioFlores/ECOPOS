document.getElementById('btn-confirmar-retiro').addEventListener('click', async () => {
    const cantidad = parseFloat(document.getElementById('cantidad-retiro').value);
    const motivo = document.getElementById('motivo-retiro').value.trim();
    const username = document.getElementById('cajero-retiro').value.trim();
    const contraseña = document.getElementById('contraseña-retiro').value;
    const confContraseña = document.getElementById('conf-contraseña-retiro').value;

    // Validaciones básicas
    if (cantidad <= 0 || !motivo || !username || !contraseña || !confContraseña) {
        return alert('Por favor completa todos los campos correctamente.');
    }
    if (contraseña !== confContraseña) {
        return alert('Las contraseñas no coinciden.');
    }

    try {
        const response = await fetch('http://localhost:3000/retiros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad, motivo, username, contraseña })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Retiro realizado con éxito.');
            // Opcional: limpiar inputs
            document.getElementById('retiro').querySelectorAll('input').forEach(i => i.value = '');
        } else {
            alert(data.error || 'Error al realizar el retiro.');
        }
    } catch (error) {
        console.error('Error al enviar retiro:', error);
        alert('Fallo en la conexión con el servidor.');
    }
});

document.getElementById('btn-cancelar-retiro').addEventListener('click', () => {
    document.getElementById('retiro').querySelectorAll('input').forEach(i => i.value = '');
});