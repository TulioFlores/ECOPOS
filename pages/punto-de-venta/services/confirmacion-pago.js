//Funcionalidad a la ventana modal para confirmar la venta
const filasTipoPago = document.querySelectorAll("#body-pago > tr");

filasTipoPago.forEach(fila => {
    fila.addEventListener('click', function () {
        console.log("Click")
        deseleccionarFilasPago(); // Asegura que solo una fila esté seleccionada
        fila.classList.add('pago-seleccionado'); // Agrega la clase a la fila que se clickeó
    });
});
function deseleccionarFilasPago() {
    document.querySelectorAll('.pago-seleccionado').forEach(fila => {
        fila.classList.remove('pago-seleccionado');
    });
}
//Funcionalidad metodo de pago en efectivo
document.getElementById('efectivo').addEventListener('keypress', async (event) => {
    // Detectamos si la tecla presionada es "Enter"
    if (event.key === 'Enter') {
        // Obtener el valor del input
        const telefono = document.getElementById('cliente').value;
        
        // Verificar si el input no está vacío
        if (telefono.trim() === '') {
            console.log('Por favor ingresa un nombre para buscar');
            return;
        }
        
        try {
            // Realizar la solicitud fetch con el nombre ingresado
            const response = await fetch(`http://localhost:3000/cliente/${telefono}`);
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

            
            const data = await response.json(); 

            console.log('Datos recibidos desde el servidor:', data);
            // Mostrar la respuesta en consola (puedes hacer lo que necesites con los datos)
            console.log(data);

            // Llamamos a la función para mostrar los resultados
            mostrarCliente(data);
        } catch (error) {
            console.error('Hubo un problema con la solicitud:', error);
        }
    }
});
function mostrarCliente(cliente){
    const telefono = document.getElementById("cliente");
    telefono.value = cliente.telefono;

    const nombre = document.getElementById("nombre-cliente");
    nombre.innerText = cliente.nombre;

}

document.getElementById("aplicar-venta").addEventListener("click", () => {
    let total = 0;
    console.log("Entra a boton confirmar");
    // Recorre las filas de la tabla con productos
    const filas = document.querySelectorAll("#tabla-principal tbody tr");

    filas.forEach(fila => {
        
        const subtotal = parseFloat(fila.querySelector(".col-total")?.textContent || 0);
        console.log(subtotal);
        if (!isNaN(subtotal)) {
            total += subtotal;
        }
        
    });

    // Asignamos valores al resumen
    document.getElementById("importe").textContent = total.toFixed(2);
    document.getElementById("pagado").textContent = "0.00";
    document.getElementById("porpagar").textContent = total.toFixed(2);
    document.getElementById("cambio").textContent = "0.00";

    // También puedes llenar el nombre del cliente si lo tienes
    // const nombreCliente = document.querySelector("#cliente-seleccionado")?.textContent || "Sin nombre";
    // document.getElementById("nombre-cliente").textContent = nombreCliente;
});



const inputEfectivo = document.getElementById('input-efectivo');
const importeElement = document.getElementById('importe');
const cambioElement = document.getElementById('cambio');
const botonConfirmar = document.getElementById('boton-confirmar');
const porPagarElement = document.getElementById('porpagar');

inputEfectivo.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();

        const efectivo = parseFloat(inputEfectivo.value) || 0;
        const importe = parseFloat(importeElement.textContent) || 0;

        // Buscar si la fila de "Efectivo" está seleccionada
        const filaEfectivo = Array.from(document.querySelectorAll('#body-pago > tr'))
            .find(fila => fila.classList.contains('pago-seleccionado') && fila.children[1].textContent.includes('Efectivo'));

        if (!filaEfectivo) {
            alert('Selecciona el tipo de pago "Efectivo" para continuar.');
            return;
        }

        const diferencia = efectivo - importe;

        if (diferencia >= 0) {
            cambioElement.textContent = diferencia.toFixed(2);
            porPagarElement.textContent = "0.00";

            // Aplicar venta
            botonConfirmar.click(); // Puedes cambiarlo por la lógica de tu venta
        } else {
            cambioElement.textContent = "0.00";
            porPagarElement.textContent = Math.abs(diferencia).toFixed(2);
        }
    }
});


botonConfirmar.addEventListener('click', async () => {
    const productos = [];
    const filas = document.querySelectorAll("#tabla-principal tbody tr");

    filas.forEach(fila => {
        const id = fila.dataset.idProducto; // Asegúrate de guardar data-id-producto en cada tr
        const nombre = fila.querySelector(".col-nombre")?.textContent;
        const precio = fila.dataset.precio;
        const cantidad = parseInt(fila.querySelector(".col-cantidad")?.textContent || 1);
        const total = parseFloat(fila.querySelector(".col-total")?.textContent || 0);

        productos.push({ id, nombre, precio, cantidad, total });
    });

    const venta = {
        productos,
        total: parseFloat(document.getElementById("importe").textContent),
        pagado: parseFloat(document.getElementById("pagado").textContent),
        porPagar: parseFloat(document.getElementById("porpagar").textContent),
        cambio: parseFloat(document.getElementById("cambio").textContent),
        tipoPago: obtenerTipoPagoSeleccionado(), // 'Efectivo', 'Tarjeta', etc.
        cliente: document.getElementById("nombre-cliente").textContent || 'General',
    };

    // Enviar al backend
    try {
        const response = await fetch('/api/ventas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venta)
        });

        const resultado = await response.json();

        if (resultado.success) {
            alert("Venta completada con éxito");
            cerrarVentana(); // tu función para cerrar modal
        } else {
            alert("Error al guardar la venta");
        }
    } catch (error) {
        console.error("Error al enviar la venta:", error);
    }
});

function obtenerTipoPagoSeleccionado() {
    const fila = document.querySelector('#body-pago > tr.pago-seleccionado');
    return fila ? fila.children[1].textContent.trim() : 'Sin especificar';
}
