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

// Función para agregar un producto a la tabla
function agregarProductoATabla(producto, cantidad) {
  const tbody = document.getElementById('productos-body');

  // Crear la fila con los datos del producto
  const fila = document.createElement('tr');
    fila.classList.add('row');

  fila.innerHTML = `
      <td class="col-3 text-center" >${producto.id}</td>
      <td class="col-3 text-center" >${producto.descripcion}</td>
      <td class="col-3 text-center" >${cantidad}</td>
      <td class="col-3 text-center" >$${(producto.precio * cantidad).toFixed(2)}</td>`;

      
  // Agregar la fila a la tabla
  tbody.appendChild(fila);

  // Agregar evento para seleccionar/deseleccionar la fila
    fila.addEventListener('click', function () {
        deseleccionarFilas(); // Asegura que solo una fila esté seleccionada
        fila.classList.add('seleccionado');
    });
   
    document.getElementById('btn-eliminar').addEventListener('click', function () {
        const filaSeleccionada = document.querySelector('.seleccionado');

    if (filaSeleccionada) {
        // Obtener el monto desde la cuarta columna (índice 3)
        const montoTexto = filaSeleccionada.cells[3].innerText.replace('$', '');
        const monto = parseFloat(montoTexto) || 0; // Asegurar que es un número válido

        filaSeleccionada.remove(); // Elimina la fila de la tabla
        actualizarTotal(-monto); // Resta el monto al total
    } 
    });
  // Actualizar el total
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

// Evento del formulario para escanear el producto
document.getElementById('form-escaneo').addEventListener('submit', function (e) {
  e.preventDefault();

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
