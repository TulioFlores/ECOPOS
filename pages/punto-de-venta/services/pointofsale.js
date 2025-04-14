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
    fila.dataset.idProducto = producto.id;
    fila.dataset.precio = producto.precio;

    fila.classList.add('row');

  fila.innerHTML = `
      <td class="col-3 text-center" >${producto.id}</td>
      <td class="col-3 text-center col-nombre" >${producto.descripcion}</td>
      <td class="col-3 text-center" col-cantidad >${cantidad}</td>
      <td class="col-3 text-center col-total" >${(producto.precio * cantidad).toFixed(2)}</td>`;

      
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
    document.querySelectorAll('.pago-seleccionado').forEach(fila => {
        fila.classList.remove('pago-seleccionado');
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
//Modal para ingresar un nuevo cliente

const modalRetiro = document.getElementById("retiro");
const btnAbrirRetiro = document.getElementById("boton-retiro");
const btnCancelarRetiro = document.getElementById("btn-cancelar-retiro");
const btnConfirmarRetiro = document.getElementById("btn-confirmar-retiro");

btnAbrirRetiro.addEventListener("click", () => {
    modalRetiro.style.display = "flex";
});

btnCancelarRetiro.addEventListener("click", () => {
    modalRetiro.style.display = "none";
});

//Modal para ver las existencias

const modalExistencias = document.getElementById("existencias");
const btnAbrirExistencias= document.getElementById("boton-existencias");
const btnCerrarExistencias = document.getElementById("btn-cancelar-existencias");

btnAbrirExistencias.addEventListener("click", () => {
    modalExistencias.style.display = "flex";
});

btnCerrarExistencias.addEventListener("click", () => {
    modalExistencias.style.display = "none";
});


//Modal para ver la venta por dia

const modalVentaPorDia = document.getElementById("venta-por-dia");
const btnAbrirVentaPorDia= document.getElementById("boton-venta-por-dia");
const btnCerrarVentaPorDia = document.getElementById("cerrar-venta-por-dia");

btnAbrirVentaPorDia.addEventListener("click", () => {
    modalVentaPorDia.style.display = "flex";
});

btnCerrarVentaPorDia.addEventListener("click", () => {
    modalVentaPorDia.style.display = "none";
});

//Modal para ver la venta por dia

const modalVentaPorEmpleado = document.getElementById("venta-por-empleado");
const btnAbrirVentaPorEmpleado = document.getElementById("boton-venta-por-empleado");
const btnCerrarVentaPorEmpleado = document.getElementById("cerrar-venta-por-empleado");

btnAbrirVentaPorEmpleado.addEventListener("click", () => {
    modalVentaPorEmpleado.style.display = "flex";
});

btnCerrarVentaPorEmpleado.addEventListener("click", () => {
    modalVentaPorEmpleado.style.display = "none";
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

document.getElementById('cajero').addEventListener('keypress', async (event) => {
    // Detectamos si la tecla presionada es "Enter"
    console.log("cajero1 ");
    if (event.key === 'Enter') {
        // Obtener el valor del input
        console.log("hola");
        const idBuscado = document.getElementById('cajero').value;
        
        // Verificar si el input no está vacío
        if (idBuscado.trim() === '') {
            console.log('Por favor ingresa un nombre para buscar');
            return;
        }
        
        try {
            // Realizar la solicitud fetch con el nombre ingresado
            const response = await fetch(`http://localhost:3000/empleado/${idBuscado}`);
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

            
            const data = await response.json(); 

            console.log('Datos recibidos desde el servidor:', data);
            // Mostrar la respuesta en consola (puedes hacer lo que necesites con los datos)
            console.log(data);

            // Llamamos a la función para mostrar los resultados
            mostrarEmpleado(data);
        } catch (error) {
            console.error('Hubo un problema con la solicitud:', error);
        }
    }
});

function mostrarEmpleado(empleado){
    const nombreEmpleado = document.getElementById("nombre-empleado");
    console.log(nombreEmpleado.value);
    nombreEmpleado.value = empleado.nombre;

}


document.getElementById('cliente').addEventListener('keypress', async (event) => {
    // Detectamos si la tecla presionada es "Enter"
    console.log("holacliente1");
    if (event.key === 'Enter') {
        // Obtener el valor del input
        console.log("hola cliente");
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


//Funcionalidad a la ventana modal para confirmar la venta
// Agregar evento para seleccionar/deseleccionar la fila
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

