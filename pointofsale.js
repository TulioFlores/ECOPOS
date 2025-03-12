 // Simulación de productos (puedes sustituir esto por una consulta a tu backend)
 const productosDB = [
    { id: 101, descripcion: "Producto A", precio: 50 },
    { id: 102, descripcion: "Producto B", precio: 75 },
    { id: 103, descripcion: "Producto C", precio: 120 },
];

// Función para agregar un producto a la tabla
document.getElementById('form-escaneo').addEventListener('submit', function (e) {
    e.preventDefault();

    const productoInput = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');

    const idProducto = parseInt(productoInput.value);
    const cantidad = parseInt(cantidadInput.value);

    // Buscar el producto en la "base de datos"
    const producto = productosDB.find(p => p.id === idProducto);

    if (producto) {
        agregarProductoATabla(producto, cantidad);
        productoInput.value = '';
        cantidadInput.value = '1';
    } else {
        alert("Producto no encontrado");
    }
    console.log("Funciona");
});

function agregarProductoATabla(producto, cantidad) {
    const tbody = document.getElementById('productos-body');

    // Crear la fila con los datos del producto
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${producto.id}</td>
        <td>${producto.descripcion}</td>
        <td>${cantidad}</td>
        <td>$${(producto.precio * cantidad).toFixed(2)}</td>`;

    // Agregar la fila a la tabla
    tbody.appendChild(fila);

    // Actualizar el total
    actualizarTotal(producto.precio * cantidad);
}

function actualizarTotal(monto) {
    const totalElemento = document.getElementById('total-neto');
    const totalActual = parseFloat(totalElemento.innerText.replace('$', '')) || 0;
    totalElemento.innerText = `$${(totalActual + monto).toFixed(2)}`;
}   