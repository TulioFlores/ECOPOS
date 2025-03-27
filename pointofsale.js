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

// Modal para confirmar la venta
const modal = document.querySelector(".contenedor-pago");
const btnAbrir = document.getElementById("aplicar-venta");
const btnCerrar = document.getElementById("cancelar-venta");
const btnConfirmar = document.getElementById("boton-confirmar");

// Abrir el modal
btnAbrir.addEventListener("click", () => {
    modal.style.display = "flex";
});

// Cerrar el modal al hacer clic en la "X"
btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
});


//Modal para buscar productos
const modalBuscar = document.querySelector(".buscar-producto");
const btnAbrirPrd = document.getElementById("buscar");
const btnCerrarPrd = document.getElementById("cerrar-busqueda");

btnAbrirPrd.addEventListener("click", () => {
    modalBuscar.style.display = "flex";
});

btnCerrarPrd.addEventListener("click", () => {
    modalBuscar.style.display = "none";
});


//Modal para ingresar un nuevo cliente

const modalCliente = document.querySelector(".nuevo-cliente");
const btnAbrirCliente = document.getElementById("nuevocliente");
const btnCancelarCliente = document.getElementById("btn-cancelar-cliente");
const btnConfirmarCliente = document.getElementById("btn-confirmar-cliente");

btnAbrirCliente.addEventListener("click", () => {
    modalCliente.style.display = "flex";
});

btnCancelarCliente.addEventListener("click", () => {
    modalCliente.style.display = "none";
});


//Modal para registrar un empleado

const modalEmpleado = document.getElementById("alta-empleado");
const btnAbrirEmpleado = document.getElementById("abrir-empleado");
const btnCancelarEmpleado = document.getElementById("btn-cancelar-empleado");
const btnConfirmarEmpleado = document.getElementById("btn-confirmar-empleado");

btnAbrirEmpleado.addEventListener("click", () => {
    modalEmpleado.style.display = "flex";
});

btnCancelarEmpleado.addEventListener("click", () => {
    modalEmpleado.style.display = "none";
});

/////////////////////////////
////////////////////////////
//Codigo para la busqueda de productos

document.getElementById('busqueda-producto').addEventListener('input', async (event) => {
    // Detectamos si la tecla presionada es "Enter"
    // if (event.key === 'Enter') {
        // Obtener el valor del input
        const nombreBuscado = document.getElementById('busqueda-producto').value;
        
        // Verificar si el input no está vacío
        if (nombreBuscado.trim() === '') {
            console.log('Por favor ingresa un nombre para buscar');
            return;
        }
        
        try {
            // Realizar la solicitud fetch con el nombre ingresado
            const response = await fetch(`http://localhost:3000/buscar/${nombreBuscado}`);
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

            // Obtener la respuesta en formato JSON
            const data = await response.json();
            
            // Mostrar la respuesta en consola (puedes hacer lo que necesites con los datos)
            console.log(data);

            // Llamamos a la función para mostrar los resultados
            mostrarResultados(data);
        } catch (error) {
            console.error('Hubo un problema con la solicitud:', error);
        }
    // }
});



function mostrarResultados(productos) {
    
    if (productos.length === 0) {
        resultadosDiv.innerHTML = '<p>No se encontraron productos</p>';
        return;
    }

    // Obtener el cuerpo de la tabla (tbody) para agregar las filas
    const tbody = document.getElementById('tabla-busqueda'); // Asegúrate de que #tabla-busqueda es correcto
    tbody.innerHTML = ''; // Limpiar cualquier contenido previo en el tbody

    productos.forEach(producto => {
        // Crear una fila para cada producto
        const fila = document.createElement('tr');
        fila.classList.add('row');
        // Agregar un td para cada propiedad del producto
        fila.innerHTML = `
            <td class="col-3 text-center">${producto.id}</td>
            <td class="col-3 text-center">${producto.descripcion}</td>
            <td class="col-3 text-center">${producto.stock}</td>
            <td class="col-3 text-center">$${producto.precio}</td>
        `;
    
        // Agregar la fila al cuerpo de la tabla
        tbody.appendChild(fila);
    });
}





// // Escuchar el evento de búsqueda
// document.getElementById('buscar-producto').addEventListener('input', buscarProductos);
