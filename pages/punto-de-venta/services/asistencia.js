document.getElementById('registrar').addEventListener('click', () => {
        const idEmpleado = document.getElementById('numEmpleado').value.trim();
        const nombre = document.getElementById('nombreEmpleado').value.trim();
        const apellidoP = document.getElementById('apellidoP').value.trim();
        const apellidoM = document.getElementById('apellidoM').value.trim();
        const tipo = document.getElementById('tipoAsistencia').value;

        const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

        // Validación de campos
        if (!idEmpleado || !nombre || !apellidoP || !apellidoM ||
            !soloLetras.test(nombre) || !soloLetras.test(apellidoP) || !soloLetras.test(apellidoM)) {
            alert("Formulario incompleto o inválido. Verifica que los nombres y apellidos contengan solo letras.");
            return;
        }

        // Envío al servidor
        fetch('http://localhost:3000/registrar-asistencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_empleado: idEmpleado, tipo: tipo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.mensaje || 'Asistencia registrada');
            }
        })
        .catch(err => {
            console.error('Error al registrar:', err);
            alert('Error al registrar la asistencia');
        });
    });