// Datos simulados (estos pueden venir de tu base de datos)
const ticketData = {
    negocio: "Tienda Ejemplo",
    rfc: "XYZ123456789",
    direccion: "Av. Siempre Viva #742",
    telefono: "555-987-6543",
    fecha: new Date().toLocaleString(),
    numeroTicket: "001235",
    cajero: "Juan Pérez",
    metodoPago: "Efectivo",
    total: 150.00,
    productos: [
        { cantidad: 2, descripcion: "Agua 1L", precio: 10.00, total: 20.00 },
        { cantidad: 1, descripcion: "Refresco 500ml", precio: 15.00, total: 15.00 },
        { cantidad: 3, descripcion: "Pan dulce", precio: 5.00, total: 15.00 }
    ]
};

// Llenar datos en el ticket
document.getElementById("nombreNegocio").innerText = ticketData.negocio;
document.getElementById("rfc").innerText = "RFC: " + ticketData.rfc;
document.getElementById("direccion").innerText = "Dirección: " + ticketData.direccion;
document.getElementById("telefono").innerText = "Tel: " + ticketData.telefono;
document.getElementById("fecha").innerText = ticketData.fecha;
document.getElementById("numeroTicket").innerText = ticketData.numeroTicket;
document.getElementById("cajero").innerText = ticketData.cajero;
document.getElementById("metodoPago").innerText = ticketData.metodoPago;
document.getElementById("total").innerText = ticketData.total.toFixed(2);

// Llenar la tabla de productos con innerHTML
const detalleTicket = document.getElementById("detalleTicket");
detalleTicket.innerHTML = ""; // Limpiar contenido previo
ticketData.productos.forEach(producto => {
    detalleTicket.innerHTML += `
        <tr>
            <td>${producto.cantidad}</td>
            <td>${producto.descripcion}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>$${producto.total.toFixed(2)}</td>
        </tr>
    `;
});
