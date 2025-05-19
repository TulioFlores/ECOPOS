



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
    const modal = new bootstrap.Modal(document.getElementById("modalBusquedaProducto"));
    modal.show();
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



//Modal para realizar retiro

const modalRetiro = document.getElementById("retiro");
const btnAbrirRetiro = document.getElementById("boton-retiro");
const btnCancelarRetiro = document.getElementById("btn-cancelar-retiro");
const btnConfirmarRetiro = document.getElementById("btn-confirmar-retiro");

btnAbrirRetiro.addEventListener("click", () => {
    const modalRetiro = new bootstrap.Modal(document.getElementById('modalRetiro'));
    modalRetiro.show();
});

btnCancelarRetiro.addEventListener("click", () => {
    
});

//Modal para ver las existencias

const modalExistencias = document.getElementById("existencias");
const btnAbrirExistencias= document.getElementById("boton-existencias");
const btnCerrarExistencias = document.getElementById("btn-cancelar-existencias");

btnAbrirExistencias.addEventListener("click", () => {
    const modalExistencias = new bootstrap.Modal(document.getElementById('modalExistencias'));
    modalExistencias.show();
});

btnCerrarExistencias.addEventListener("click", () => {
});





/////////////////////////////
////////////////////////////


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


//Modal para cerrar la ventana del ticket
document.getElementById("cerrar-modal-ticket").addEventListener("click", () => {
    document.getElementById("modal-ticket").style.display = "none";
  });
  

//Modal para alerta
  function mostrarAlerta(mensaje, tipo = 'error') {
    const alerta = document.getElementById("alerta");
    const texto = document.getElementById("alerta-mensaje");

    alerta.className = 'alerta-venta'; // reset
    if (tipo === 'success') alerta.classList.add('success');

    texto.textContent = mensaje;
    alerta.style.display = 'block';

    setTimeout(() => {
        alerta.style.display = 'none';
    }, 3000);
}
