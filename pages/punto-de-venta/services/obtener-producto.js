// Evento del formulario para escanear el producto

const botonEnter = document.getElementById('enter');
botonEnter.addEventListener('click', () => {
  
    const productoInput = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
  
    const idProducto = parseInt(productoInput.value);
    const cantidad = parseInt(cantidadInput.value) || 1; // Por defecto, 1 si no hay cantidad
  
    // Validar que el ID del producto es un número válido
    if (isNaN(idProducto)) {
        alert("Ingresa un ID de producto válido.");
        return;
    }
  
    // Llamar al backend para obtener el producto
    obtenerProductoPorId(idProducto, (err, producto) => {
        if (err) {
            console.log("Producto no encontrado.");
        } else {
            agregarProductoATabla(producto, cantidad);
            productoInput.value = '';
            cantidadInput.value = '1';
        }
    });
  });
// Función para obtener un producto desde el backend
function obtenerProductoPorId(idProducto, callback) {
    fetch(`http://localhost:3000/producto/${idProducto}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Producto no encontrado');
            }
            return response.json();
        })
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
  }
  
  function agregarProductoATabla(producto, cantidad) {
    const tbody = document.getElementById('productos-body');

    // Crear la fila
    const fila = document.createElement('tr');
    fila.dataset.idProducto = producto.id;
    fila.dataset.precio = producto.precio;
    fila.classList.add('row');

    fila.innerHTML = `
        <td class="col-3 text-center">${producto.id}</td>
        <td class="col-3 text-center col-nombre">${producto.descripcion}</td>
        <td class="col-3 text-center col-cantidad">
            <input type="number" class="form-control form-control-sm text-center cantidad-fila" 
                value="${cantidad}" min="1" style="all: unset;">
        </td>
        <td class="col-3 text-center col-total">$${(producto.precio * cantidad).toFixed(2)}</td>
    `;

    tbody.appendChild(fila);

    // Agregar evento para seleccionar/deseleccionar la fila
    fila.addEventListener('click', function () {
        if (this.classList.contains('seleccionado')) {
            this.classList.remove('seleccionado');
        } else {
            deseleccionarFilas();
            this.classList.add('seleccionado');
        }
    });

    // Evento para cambiar la cantidad dentro de la fila
    const inputCantidadFila = fila.querySelector('.cantidad-fila');
    inputCantidadFila.addEventListener('change', function () {
        let nuevaCantidad = parseInt(this.value);
        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
            nuevaCantidad = 1; // Validar que mínimo sea 1
            this.value = 1;
        }

        const precioUnitario = parseFloat(fila.dataset.precio) || 0;

        // Obtener el monto anterior
        const montoAnteriorTexto = fila.querySelector('.col-total').innerText.replace('$', '');
        const montoAnterior = parseFloat(montoAnteriorTexto) || 0;

        // Calcular el nuevo monto
        const nuevoMonto = precioUnitario * nuevaCantidad;

        // Actualizar el subtotal de la fila
        fila.querySelector('.col-total').innerText = `$${nuevoMonto.toFixed(2)}`;

        // Actualizar el total neto
        actualizarTotal(nuevoMonto - montoAnterior);
    });

    // Evento del botón eliminar (debe estar aquí para funcionar bien)
    const btnEliminar = document.getElementById('btn-eliminar');
    btnEliminar.addEventListener('click', function () {
        const filaSeleccionada = document.querySelector('.seleccionado');
        if (filaSeleccionada && filaSeleccionada.cells.length >= 4) {
            const montoTexto = filaSeleccionada.cells[3].innerText.replace('$', '');
            const monto = parseFloat(montoTexto) || 0;

            filaSeleccionada.remove();
            actualizarTotal(-monto);
        }
    });

    // Actualizar el total al agregar el producto
    actualizarTotal(producto.precio * cantidad);
}

  function deseleccionarFilas() {
    document.querySelectorAll('.seleccionado').forEach(fila => {
        fila.classList.remove('seleccionado');
    });
      
  }
  
  // Función para actualizar el total en el pie de la tabla
  function actualizarTotal(monto) {
    const totalElemento = document.getElementById('total-neto');
    const totalActual = parseFloat(totalElemento.innerText.replace('$', '')) || 0;
    totalElemento.innerText = `$${(totalActual + monto).toFixed(2)}`;
  }

