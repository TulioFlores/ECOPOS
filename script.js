// Función para actualizar la fecha y la hora
function actualizarFechaHora() {
    const fechaInput = document.getElementById("fecha");
    const horaInput = document.getElementById("hora");

    const ahora = new Date();
    
    // Formato de la fecha (DD/MM/AAAA)
    const fechaFormateada = ahora.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    // Formato de la hora (HH:MM:SS)
    const horaFormateada = ahora.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    // Insertar valores en los inputs
    fechaInput.value = fechaFormateada;
    horaInput.value = horaFormateada;
}

// Llamar a la función al cargar la página
actualizarFechaHora();

// Actualizar la hora cada segundo
setInterval(actualizarFechaHora, 1000);

// Función para aplicar cierre y calcular la venta neta
function aplicarCierre() {
    // Obtener los valores de los campos de entrada
    const ventaBruta = parseFloat(document.querySelector('.venta-bruta').value);
    const devoluciones = parseFloat(document.querySelector('.devoluciones').value);
    const gastos = parseFloat(document.querySelector('.gastos').value);

    // Validar si los campos están vacíos o contienen valores no numéricos
    if (isNaN(ventaBruta) || isNaN(devoluciones) || isNaN(gastos)) {
        alert("Por favor ingrese valores válidos en todos los campos.");
        return; // Salir de la función si hay algún valor inválido
    }

    // Calcular la venta neta
    const ventaNeta = ventaBruta - (devoluciones + gastos);

    // Actualizar la venta neta en la interfaz
    document.querySelector('.venta-neta').innerText = ventaNeta.toFixed(2); // Limitar a 2 decimales

    // Calcular el total de las formas de pago en el sistema
    const retiroParcial = parseFloat(document.querySelector('.retiros-parciales').value) || 0;
    const efectivo = parseFloat(document.querySelector('.efectivo').value) || 0;
    const tarjeta = parseFloat(document.querySelector('.tarjeta').value) || 0;
    const otrasFormasPago = parseFloat(document.querySelector('.otras-pagos').value) || 0;

    // Calcular el total de las formas de pago a capturar
    const captura1 = parseFloat(document.querySelector('.captura1').value) || 0;
    const captura2 = parseFloat(document.querySelector('.captura2').value) || 0;
    const captura3 = parseFloat(document.querySelector('.captura3').value) || 0;
    const captura4 = parseFloat(document.querySelector('.captura4').value) || 0;

    // Sumar las formas de pago en el sistema y las formas de pago a capturar
    const totalPago = retiroParcial + efectivo + tarjeta + otrasFormasPago + captura1 + captura2 + captura3 + captura4;

    // Actualizar el total de formas de pago en el sistema
    document.querySelector('.total-pago').value = totalPago.toFixed(2); // Limitar a 2 decimales
}

document.querySelector('button:nth-child(3)').addEventListener('click', () => {
    window.close(); // Cierra la ventana del navegador
});

function limpiarCampos() {
    // Limpiar los campos de entrada
    document.querySelector('.venta-bruta').value = '';
    document.querySelector('.devoluciones').value = '';
    document.querySelector('.gastos').value = '';
    document.querySelector('.venta-neta').innerText = '0';

    // Limpiar las formas de pago en el sistema
    document.querySelectorAll('.formas-sistema input').forEach(input => {
        input.value = '';
    });

    // Limpiar las formas de pago a capturar
    document.querySelectorAll('.formas-captura input').forEach(input => {
        input.value = '';
    });

    // Limpiar el número de empleado
    document.querySelector('.num-empleado').value = '';
}



