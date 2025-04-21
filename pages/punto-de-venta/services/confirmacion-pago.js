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
    
    const modal = document.querySelector(".contenedor-pago");    
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
        const response = await fetch('http://localhost:3000/ventas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venta)
        });

        const resultado = await response.json();

        if (resultado.success) {
            alert("Venta completada con éxito");
            // Cerrar el modal al hacer clic en la "X"
            modal.style.display = "none";
            limpiarInterfazVenta(); // limpia la interfaz para una nueva venta
            
            
            
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
function limpiarInterfazVenta() {
    // Limpiar la tabla de productos (tabla principal)
    const cuerpoTabla = document.querySelector("#tabla-principal tbody");
    if (cuerpoTabla) {
        cuerpoTabla.innerHTML = "";
    }

    // Limpiar los totales
    document.getElementById("importe").textContent = "0.00";
    document.getElementById("pagado").textContent = "0.00";
    document.getElementById("porpagar").textContent = "0.00";
    document.getElementById("cambio").textContent = "0.00";
    document.getElementById("total-neto").textContent = "0.00";
    document.getElementById("cliente").value="";

    // Limpiar input de efectivo
    document.getElementById("input-efectivo").value = "";

    // Deseleccionar fila de método de pago
    deseleccionarFilasPago();

    // (Opcional) Limpiar cliente si estás usando un campo
    const clienteElement = document.getElementById("nombre-cliente");
    if (clienteElement) {
        clienteElement.textContent = "";
    }

    // (Opcional) Volver a enfocar al input de producto
    const inputProducto = document.getElementById("producto");
    if (inputProducto) {
        inputProducto.focus();
    }
}

