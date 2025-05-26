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
  console.log("Entra a botón confirmar");

  // Recorre las filas de la tabla con productos
  const filas = document.querySelectorAll("#tabla-principal tbody tr");
  filas.forEach(fila => {
      const subtotalTexto = fila.querySelector(".col-total")?.textContent.trim() || "0";
      const subtotal = parseFloat(subtotalTexto.replace('$', ''));

      console.log(`Subtotal fila: ${subtotal}`);

      if (!isNaN(subtotal)) {
          total += subtotal;
      }
  });

  // Asignar valores al resumen
  document.getElementById("importe").textContent = total.toFixed(2);
  document.getElementById("pagado").textContent = "0.00";
  document.getElementById("porpagar").textContent = total.toFixed(2);
  document.getElementById("cambio").textContent = "0.00";
});






// Función genérica para actualizar pagos
function actualizarPagos(monto, metodo) {
  const importe = parseFloat(importeElement.textContent) || 0;
  const pagadoActual = parseFloat(document.getElementById('pagado').textContent) || 0;
  const nuevoPagado = pagadoActual + monto;
  const restante = importe - nuevoPagado;

  document.getElementById("pagado").textContent = nuevoPagado.toFixed(2);
  document.getElementById("porpagar").textContent = (restante > 0 ? restante.toFixed(2) : "0.00");
  document.getElementById("cambio").textContent = (nuevoPagado > importe ? (nuevoPagado - importe).toFixed(2) : "0.00");

  console.log(`💵 Pago registrado: ${metodo} -> $${monto}`);
}

// Declarar acumuladores
let montoEfectivo = 0;
let montoTarjeta = 0;
let montoPagoMercado = 0;

const inputTarjeta = document.getElementById('input-tarjeta');
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

    const filaEfectivo = Array.from(document.querySelectorAll('#body-pago > tr'))
      .find(fila => fila.classList.contains('pago-seleccionado') && fila.children[1].textContent.includes('Efectivo'));

    if (!filaEfectivo) {
      mostrarAlerta('Selecciona "Efectivo" como forma de pago primero.');
      return;
    }

    // Actualiza el monto efectivo con lo que hay en el input (sin acumular)
    montoEfectivo = efectivo;

    // Calcula el total pagado sumando tarjeta + efectivo
    const pagadoTotal = montoEfectivo + montoTarjeta;
    const restante = importe - pagadoTotal;

    document.getElementById("pagado").textContent = pagadoTotal.toFixed(2);
    document.getElementById("porpagar").textContent = (restante > 0 ? restante.toFixed(2) : "0.00");
    document.getElementById("cambio").textContent = (pagadoTotal > importe ? (pagadoTotal - importe).toFixed(2) : "0.00");
  }
});


inputTarjeta.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();

    const tarjeta = parseFloat(inputTarjeta.value) || 0;
    const importe = parseFloat(importeElement.textContent) || 0;

    const filaTarjeta = Array.from(document.querySelectorAll('#body-pago > tr'))
      .find(fila => fila.classList.contains('pago-seleccionado') && fila.children[1].textContent.includes('Tarjeta'));

    if (!filaTarjeta) {
      mostrarAlerta('Selecciona "Tarjeta" como forma de pago primero.');
      return;
    }

    // Actualiza el monto tarjeta con lo que hay en el input (sin acumular)
    montoTarjeta = tarjeta;

    // Calcula el total pagado sumando tarjeta + efectivo
    const pagadoTotal = montoEfectivo + montoTarjeta;
    const restante = importe - pagadoTotal;

    document.getElementById("pagado").textContent = pagadoTotal.toFixed(2);
    document.getElementById("porpagar").textContent = (restante > 0 ? restante.toFixed(2) : "0.00");
    document.getElementById("cambio").textContent = (pagadoTotal > importe ? (pagadoTotal - importe).toFixed(2) : "0.00");
  }
});


const socket = io('http://localhost:3000');

document.getElementById('qrModal')?.addEventListener('shown.bs.modal', () => {
  montoPagoMercado = 0; // Reiniciar si se vuelve a abrir
});

// Confirmar pago con Mercado Pago por socket
socket.on('pago-aprobado', (data) => {
  const monto = parseFloat(data.monto) || 0;
  const importe = parseFloat(document.getElementById('importe').textContent) || 0;
  const pagadoActual = parseFloat(document.getElementById('pagado').textContent) || 0;

  montoPagoMercado += monto;

  const nuevoPagado = pagadoActual + monto;
  const restante = importe - nuevoPagado;

  document.getElementById("pagado").textContent = nuevoPagado.toFixed(2);
  document.getElementById("porpagar").textContent = (restante > 0 ? restante.toFixed(2) : "0.00");
  document.getElementById("cambio").textContent = (nuevoPagado > importe ? (nuevoPagado - importe).toFixed(2) : "0.00");

  const qrModal = bootstrap.Modal.getInstance(document.getElementById('qrModal'));
  if (qrModal) qrModal.hide();
  mostrarAlerta("Pago por Mercado Pago recibido");
});

botonConfirmar.addEventListener('click', async () => {
  const importe = parseFloat(importeElement.textContent);
  const pagado = parseFloat(document.getElementById("pagado").textContent);
  const porPagar = parseFloat(document.getElementById("porpagar").textContent);
  const cambio = parseFloat(document.getElementById("cambio").textContent);
  

  if (pagado <= 0) return mostrarAlerta("Debes ingresar al menos un pago.");
  if (pagado < importe) return mostrarAlerta("El monto pagado es insuficiente para completar la venta.");

  const tipoPago = [];
  if (montoEfectivo > 0) tipoPago.push({ metodo: "Efectivo", monto: montoEfectivo });
  if (montoTarjeta > 0) tipoPago.push({ metodo: "Tarjeta", monto: montoTarjeta });
  if (montoPagoMercado > 0) tipoPago.push({ metodo: "MercadoPago", monto: montoPagoMercado });

  const productos = [];
  const filas = document.querySelectorAll("#tabla-principal tbody tr");
  filas.forEach(fila => {
    const id = fila.dataset.idProducto;
    const nombre = fila.querySelector(".col-nombre")?.textContent;
    const precio = parseFloat(fila.dataset.precio) || 0;
    const cantidad = parseInt(fila.querySelector(".col-cantidad input")?.value) || 1;
    const total = parseFloat(fila.querySelector(".col-total")?.textContent.replace('$', '')) || 0;
    productos.push({ id, nombre, precio, cantidad, total });
  });

    const venta = {
      productos,
      total: importe,
      cliente: parseInt(localStorage.getItem("id_cliente")),
      pagado,
      porPagar,
      cambio,
      tipoPago,
      nom_cliente: localStorage.getItem("nom_cliente") || 'General'
    };
  try {
    const response = await fetch('http://localhost:3000/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venta)
    });

    const resultado = await response.json();

    if (resultado.success) {
      mostrarAlerta("Venta completada con éxito");
      mostrarTicket(resultado.qrImage, resultado.ticketUrl);
      guardarUltimoTicket(resultado.ticketUrl, resultado.qrImage);
      limpiarInterfazVenta();
      montoEfectivo = 0;            //Muy importante
      montoTarjeta = 0;
      montoPagoMercado = 0;

    } else {
      mostrarAlerta("Error al guardar la venta");
    }
  } catch (error) {
    console.error("Error al enviar la venta:", error);
    mostrarAlerta("Error al enviar la venta");
  }
});




// Función para mostrar el ticket
function mostrarTicket(qrUrl, ticketUrl) {
  const qrImg = document.getElementById("qr-image-ticket");
  const ticketLink = document.getElementById("descargar-ticket");
  const modal = document.getElementById("modal-ticket");

  qrImg.src = qrUrl;
  ticketLink.href = ticketUrl;
  modal.style.display = "flex";

  document.querySelector(".contenedor-pago").style.display = "none";
}



function obtenerTipoPagoSeleccionado() {
    const fila = document.querySelector('#body-pago > tr.pago-seleccionado');
    return fila ? fila.children[1].textContent.trim() : "";
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
    document.getElementById("input-tarjeta").value = "";
    document.getElementById("mercado-pago").value = "";

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
let qrModal;
///Pago con mercado pago
document.getElementById('mercado-pago').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const monto = parseFloat(e.target.value);
      if (isNaN(monto) || monto <= 0) {
        alert('Ingresa un monto válido');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:3000/mercadoqr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ monto })
        });
  
        const data = await response.json();
  
        if (data.qr_url) {
          const qrContainer = document.getElementById('qrContainer');
          qrContainer.innerHTML = `
            <h5>Escanea para pagar con Mercado Pago</h5>
            <img src="${data.qr_url}" alt="QR Mercado Pago" width="250">
          `;
  
          qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
          qrModal.show();
        } else {
          alert('Error al generar el QR');
        }
      } catch (err) {
        console.error(err);
        alert('Error en la solicitud');
      }
    }
  });
  


  async function generarQR() {
    const idVenta = document.getElementById("id-venta-generada").value;
  
    const response = await fetch('http://localhost:3000/generar-ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idVenta,
        productos: [
          { descripcion: 'Producto A', cantidad: 2, precio: 25 },
          { descripcion: 'Producto B', cantidad: 1, precio: 40 }
        ],
        total: 90
      })
    });
  
    const result = await response.json();
  
    if (result.success) {
      document.getElementById('qr-ticket').src = result.qrImage;
    }
  }
  

  //reimpresion de ticket
// ⏺️ Guardar el último ticket en localStorage
function guardarUltimoTicket(url, qr) {
  localStorage.setItem("ultimoTicketUrl", url);
  localStorage.setItem("ultimoQrBase64", qr);
}

// 🔄 Mostrar el último ticket desde localStorage
function mostrarUltimoTicket() {
  const url = localStorage.getItem("ultimoTicketUrl");
  const qr = localStorage.getItem("ultimoQrBase64");

  if (!url || !qr) {
    alert("No hay ticket reciente para reimprimir.");
    return;
  }

  document.getElementById("qr-image-ticket").src = qr;
  document.getElementById("descargar-ticket").href = url;
  document.getElementById("modal-ticket").style.display = "flex";
}

// 🎯 Evento al hacer clic en el botón
document.getElementById("boton-ultimo-ticket").addEventListener("click", () => {
  mostrarUltimoTicket();
});

// ❌ Cerrar el modal
document.getElementById("cerrar-modal-ticket").addEventListener("click", () => {
  document.getElementById("modal-ticket").style.display = "none";
});

