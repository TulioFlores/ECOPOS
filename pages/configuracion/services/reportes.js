import {cerrarCollapse} from './cierre-del-dia.js';
//Funcion para salir
document.getElementById("Salir").addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include" // Incluye la cookie de sesión
      });

      if (response.ok) {
        // Redirige al inicio (ajusta si tu página de inicio es distinta)
        window.location.href = "/";
      } else {
        alert("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error en logout:", error);
      alert("No se pudo cerrar sesión");
    }
  });
export function cerrarSidebar() {
  const sidebarElement = document.getElementById("sidebar");
  const sidebarInstance = bootstrap.Offcanvas.getInstance(sidebarElement);
  if (sidebarInstance) sidebarInstance.hide();
}
// Referencias a todos los modales
const modalVentaPorDia = document.getElementById("venta-por-dia");
const modalVentaPorEmpleado = document.getElementById("venta-por-empleado");
const modalEmpleado = document.getElementById("alta-empleado");
const modalProducto = document.getElementById("agregar-producto");
const modalProvedores = document.getElementById("abrir-provedores");
const modalConfiguracion = document.getElementById("modalConfiguracion");

// Botones
const btnAbrirVentaPorDia = document.getElementById("boton-venta-por-dia");
const btnAbrirVentaPorEmpleado = document.getElementById("boton-venta-por-empleado");
const btnAbrirEmpleado = document.getElementById("abrir-empleado");
const btnAbrirProducto = document.getElementById("boton-agregar-producto");
const btnAbrirProvedores = document.getElementById("boton-provedores");
const btnAbrirConfiguracion = document.getElementById("linkConfig");
// Botones cancelar/confirmar del modal de empleado
const btnCancelarEmpleado = document.getElementById("btn-cancelar-empleado");
const btnConfirmarEmpleado = document.getElementById("btn-confirmar-empleado");

// Función para cerrar todos los modales
export function cerrarTodosLosModales() {
    modalVentaPorDia.style.display = "none";
    modalVentaPorEmpleado.style.display = "none";
    modalEmpleado.style.display = "none";
    modalProducto.style.display = "none";
    modalProvedores.classList.remove("visible");
    modalProvedores.classList.add("oculto");
    modalConfiguracion.style.display = "none";
    cerrarCollapse("cierreDelDia");
}

// Abrir modal de Venta por Día
btnAbrirVentaPorDia.addEventListener("click", () => {
    const yaVisible = modalVentaPorDia.style.display === "flex";
    resaltarActivo("boton-venta-por-dia");
    cerrarTodosLosModales();
    if (!yaVisible) modalVentaPorDia.style.display = "flex";
    cerrarSidebar();
});

// Abrir modal de Venta por Empleado
btnAbrirVentaPorEmpleado.addEventListener("click", () => {
    const yaVisible = modalVentaPorEmpleado.style.display === "flex";
    resaltarActivo("boton-venta-por-empleado");
    cerrarTodosLosModales();
    if (!yaVisible) modalVentaPorEmpleado.style.display = "flex";
    cerrarSidebar();
});

// Abrir modal de Alta de Empleado
btnAbrirEmpleado.addEventListener("click", () => {
    const yaVisible = modalEmpleado.style.display === "flex";
    resaltarActivo("abrir-empleado");
    cerrarTodosLosModales();
    if (!yaVisible) modalEmpleado.style.display = "flex";
    cerrarSidebar();
});
// Abrir modal de Alta de Producto
btnAbrirProducto.addEventListener("click", () => {
    const yaVisible = modalProducto.style.display === "flex";
    resaltarActivo("boton-agregar-producto");
    cerrarTodosLosModales();
    if (!yaVisible) modalProducto.style.display = "flex";
    cerrarSidebar();
});
// Abrir Provedores
btnAbrirProvedores.addEventListener("click", () => {
    const yaVisible = modalProvedores.classList.contains("visible");
    resaltarActivo("boton-provedores");
    cerrarTodosLosModales();
    if (!yaVisible) {
        modalProvedores.classList.remove("oculto");
        setTimeout(() => {
            modalProvedores.classList.add("visible");
        }, 10);
    }
    cerrarSidebar();
});

// Abrir modal de Configuración
btnAbrirConfiguracion.addEventListener("click", (e) => {
    e.preventDefault(); // Previene que el link recargue o salte
    const yaVisible = modalConfiguracion.style.display === "flex";
    resaltarActivo("linkConfig");
    cerrarTodosLosModales();
    if (!yaVisible) {
        modalConfiguracion.style.display = "flex";
        cargarConfiguracion();
    }
    cerrarSidebar();
});

// Event listeners para el modal de configuración
document.getElementById("btn-cancelar-config").addEventListener("click", () => {
    modalConfiguracion.style.display = "none";
    document.getElementById("formConfiguracion").reset();
});

document.getElementById("btn-confirmar-config").addEventListener("click", guardarConfiguracion);

// Reemplazo: autenticación para Captura de Venta
const formAccesoVenta = document.getElementById('formAccesoVenta');
if (formAccesoVenta) {
  formAccesoVenta.addEventListener('submit', async function(e) {
    e.preventDefault();
    const usuario = document.getElementById('usuarioVenta').value.trim();
    const contrasena = document.getElementById('contrasenaVenta').value;
    if (!usuario || !contrasena) {
      alert('Por favor, ingresa usuario y contraseña');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/abrir-captura-venta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usuario, contrasena })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        window.location.href = '/pointofsale';
      } else {
        alert(data.error || 'Error al abrir captura');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('Error al conectar con el servidor');
    }
  });
}

  const currentPath = window.location.pathname;
  
export function resaltarActivo(id) {
  const link = document.getElementById(id);

  const estaResaltado = link.classList.contains("bg-white") && link.classList.contains("text-black");

  // Si ya está resaltado, lo desmarca
  if (estaResaltado) {
    link.classList.remove("bg-white", "text-black", "fw-bold", "px-3", "py-2", "rounded-3", "shadow-sm");
    link.classList.add("text-white");
  } else {
    // Desmarcar todos los otros botones activos
    const botonesResaltados = document.querySelectorAll(".bg-white.text-black");
    botonesResaltados.forEach(boton => {
      boton.classList.remove("bg-white", "text-black", "fw-bold", "px-3", "py-2", "rounded-3", "shadow-sm");
      boton.classList.add("text-white");
    });

    // Marcar el actual
    link.classList.remove("text-white");
    link.classList.add("bg-white", "text-black", "fw-bold", "px-3", "py-2", "rounded-3", "shadow-sm");
  }
}



  
  if (currentPath.includes("captura")) resaltarActivo("abrirCapturaVenta");
 

  //Boton para ver la venta por dia
  document.getElementById('btn-buscar-ventas').addEventListener('click', () => {
  const inicio = document.getElementById('fecha-inicio').value;
  const fin = document.getElementById('fecha-fin').value;

  if (!inicio || !fin) {
    alert('Por favor selecciona ambas fechas.');
    return;
  }

  fetch(`/api/ventas/resumen-intervalo?inicio=${inicio}&fin=${fin}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('efectivo-dia').value = parseFloat(data.total_efectivo).toFixed(2);
      document.getElementById('tarjeta-dia').value = parseFloat(data.total_tarjeta).toFixed(2);
      document.getElementById('mp-dia').value = parseFloat(data.total_mercado_pago).toFixed(2);
      document.getElementById('total-dia').value = parseFloat(data.total_general).toFixed(2);
    })
    .catch(error => {
      console.error('Error al obtener resumen:', error);
      alert('Error al buscar ventas. Revisa la consola.');
    });
});
//Ventas por intervalo y por empleado
document.getElementById('btn-buscar-empleado').addEventListener('click', async () => {
  const username = document.getElementById('usuario-empleado').value.trim();
  const fechaInicio = document.getElementById('fecha-inicio-empleado').value;
  const fechaFin = document.getElementById('fecha-fin-empleado').value;

  if (!username || !fechaInicio || !fechaFin) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  try {
    const res = await fetch('/por-empleado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inicio: fechaInicio,
        fin: fechaFin,
        username: username
      })
    });

    const data = await res.json();

    if (data.success) {
      const d = data.datos;
      document.getElementById('efectivo-empleado').value = d.total_efectivo || 0;
      document.getElementById('tarjeta-empleado').value = d.total_tarjeta || 0;
      document.getElementById('mp-empleado').value = d.total_mercado_pago || 0;
      document.getElementById('total-empleado').value = d.total_general || 0;
    } else {
      alert('No se pudo obtener el resumen.');
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    alert('Error al obtener los datos');
  }
});

// Función para mostrar mensajes debajo del formulario de alta de empleado
function mostrarMensajeEmpleado(mensaje, esError = true) {
    let div = document.getElementById('mensajeEmpleado');
    if (!div) {
        div = document.createElement('div');
        div.id = 'mensajeEmpleado';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        div.style.marginTop = '10px';
        div.style.color = esError ? 'red' : 'green';
        const form = document.getElementById('form-empleado');
        if (form) {
            form.parentNode.insertBefore(div, form.nextSibling);
        }
    }
    div.textContent = mensaje;
    div.style.color = esError ? 'red' : 'green';
}

function limpiarMensajeEmpleado() {
    const div = document.getElementById('mensajeEmpleado');
    if (div) div.textContent = '';
}

// Función para cargar la configuración
async function cargarConfiguracion() {
    try {
        const response = await fetch("http://localhost:3000/api/configuracion");
        const data = await response.json();
        
        if (data) {
            // Validar y cargar los datos en el formulario
            const nombreTienda = document.getElementById("nombreTienda");
            const direccionTienda = document.getElementById("direccionTienda");
            const telefonoTienda = document.getElementById("telefonoTienda");
            const rfcTienda = document.getElementById("rfcTienda");
            const previewLogo = document.getElementById("previewLogo");

            // Cargar datos con validación
            nombreTienda.value = data.nombre || "";
            direccionTienda.value = data.direccion || "";
            telefonoTienda.value = data.telefono || "";
            rfcTienda.value = data.rfc || "";
            
            // Manejar el logo
            if (data.logo) {
                previewLogo.innerHTML = `<img src="${data.logo}" class="img-fluid" alt="Logo actual">`;
            } else {
                previewLogo.innerHTML = "";
            }

            // Limpiar el input de archivo
            document.getElementById("logoTienda").value = "";
        }
    } catch (error) {
        console.error("Error al cargar la configuración:", error);
        alert("Error al cargar la configuración");
    }
}

// Función para mostrar mensajes de error en el formulario
function mostrarError(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}Error`) || document.createElement('div');
    errorDiv.id = `${campoId}Error`;
    errorDiv.className = 'text-danger mt-1';
    errorDiv.textContent = mensaje;
    
    // Si el div de error no existe, lo agregamos después del campo
    if (!document.getElementById(`${campoId}Error`)) {
        campo.parentNode.insertBefore(errorDiv, campo.nextSibling);
    }
    
    // Agregar clase de error al campo
    campo.classList.add('is-invalid');
}

// Función para limpiar errores
function limpiarErrores() {
    const errores = document.querySelectorAll('[id$="Error"]');
    errores.forEach(error => error.remove());
    
    // Remover clases de error de los campos
    const campos = document.querySelectorAll('.is-invalid');
    campos.forEach(campo => campo.classList.remove('is-invalid'));
}

// Función para validar el formulario
function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    const nombre = document.getElementById("nombreTienda").value.trim();
    const direccion = document.getElementById("direccionTienda").value.trim();
    const telefono = document.getElementById("telefonoTienda").value.trim();
    const rfc = document.getElementById("rfcTienda").value.trim();

    // Validación del nombre de la tienda
    if (!nombre) {
        mostrarError("nombreTienda", "El nombre de la tienda es requerido");
        esValido = false;
    } else if (nombre.length < 3 || nombre.length > 50) {
        mostrarError("nombreTienda", "El nombre debe tener entre 3 y 50 caracteres");
        esValido = false;
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,&-]+$/.test(nombre)) {
        mostrarError("nombreTienda", "El nombre solo puede contener letras, números, espacios y los caracteres .,&-");
        esValido = false;
    }

    // Validación de la dirección
    if (!direccion) {
        mostrarError("direccionTienda", "La dirección es requerida");
        esValido = false;
    } else if (direccion.length < 5 || direccion.length > 100) {
        mostrarError("direccionTienda", "La dirección debe tener entre 5 y 100 caracteres");
        esValido = false;
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#-]+$/.test(direccion)) {
        mostrarError("direccionTienda", "La dirección solo puede contener letras, números, espacios y los caracteres .,#-");
        esValido = false;
    }

    if (!telefono) {
        mostrarError("telefonoTienda", "El teléfono es requerido");
        esValido = false;
    } else if (!/^\d{10}$/.test(telefono)) {
        mostrarError("telefonoTienda", "El teléfono debe tener 10 dígitos");
        esValido = false;
    }

    if (!rfc) {
        mostrarError("rfcTienda", "El RFC es requerido");
        esValido = false;
    } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc)) {
        mostrarError("rfcTienda", "El RFC debe tener un formato válido");
        esValido = false;
    }

    return esValido;
}

// Función para guardar la configuración
async function guardarConfiguracion() {
    if (!validarFormulario()) {
        return;
    }

    try {
        // Obtener los valores del formulario
        const nombre = document.getElementById("nombreTienda").value.trim();
        const direccion = document.getElementById("direccionTienda").value.trim();
        const telefono = document.getElementById("telefonoTienda").value.trim();
        const rfc = document.getElementById("rfcTienda").value.trim();
        
        console.log('Datos a enviar:', { nombre, direccion, telefono, rfc }); // Debug

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("direccion", direccion);
        formData.append("telefono", telefono);
        formData.append("rfc", rfc);
        
        const logoFile = document.getElementById("logoTienda").files[0];
        if (logoFile) {
            formData.append("logo", logoFile);
        }

        const response = await fetch("http://localhost:3000/api/configuracion", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Mostrar mensaje de éxito
            const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success mt-3';
            successDiv.textContent = 'Configuración guardada exitosamente';
            document.getElementById("formConfiguracion").insertBefore(successDiv, document.getElementById("formConfiguracion").firstChild);
            
            // Limpiar el formulario después de 2 segundos
            setTimeout(() => {
                modalConfiguracion.style.display = "none";
                document.getElementById("formConfiguracion").reset();
                document.getElementById("previewLogo").innerHTML = "";
                successDiv.remove();
                
                // Actualizar la vista con los nuevos datos
                if (data.configuracion) {
                    const previewLogo = document.getElementById("previewLogo");
                    if (data.configuracion.logo) {
                        previewLogo.innerHTML = `<img src="${data.configuracion.logo}" class="img-fluid" alt="Logo actual">`;
                    }
                }
            }, 2000);
        } else {
            throw new Error(data.error || "Error al guardar la configuración");
        }
    } catch (error) {
        console.error("Error:", error);
        // Mostrar error en el formulario
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.textContent = error.message || "Error al guardar la configuración";
        document.getElementById("formConfiguracion").insertBefore(errorDiv, document.getElementById("formConfiguracion").firstChild);
        
        // Remover el mensaje de error después de 3 segundos
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// Agregar event listeners para validación en tiempo real
document.getElementById("nombreTienda").addEventListener("input", () => {
    const nombre = document.getElementById("nombreTienda").value.trim();
    if (!nombre) {
        mostrarError("nombreTienda", "El nombre de la tienda es requerido");
    } else if (nombre.length < 3 || nombre.length > 50) {
        mostrarError("nombreTienda", "El nombre debe tener entre 3 y 50 caracteres");
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,&-]+$/.test(nombre)) {
        mostrarError("nombreTienda", "El nombre solo puede contener letras, números, espacios y los caracteres .,&-");
    } else {
        limpiarErrores();
    }
});

document.getElementById("direccionTienda").addEventListener("input", () => {
    const direccion = document.getElementById("direccionTienda").value.trim();
    if (!direccion) {
        mostrarError("direccionTienda", "La dirección es requerida");
    } else if (direccion.length < 5 || direccion.length > 100) {
        mostrarError("direccionTienda", "La dirección debe tener entre 5 y 100 caracteres");
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#-]+$/.test(direccion)) {
        mostrarError("direccionTienda", "La dirección solo puede contener letras, números, espacios y los caracteres .,#-");
    } else {
        limpiarErrores();
    }
});

document.getElementById("telefonoTienda").addEventListener("input", () => {
    const telefono = document.getElementById("telefonoTienda").value.trim();
    if (!telefono) {
        mostrarError("telefonoTienda", "El teléfono es requerido");
    } else if (!/^\d{10}$/.test(telefono)) {
        mostrarError("telefonoTienda", "El teléfono debe tener 10 dígitos");
    } else {
        limpiarErrores();
    }
});

document.getElementById("rfcTienda").addEventListener("input", () => {
    const rfc = document.getElementById("rfcTienda").value.trim();
    if (!rfc) {
        mostrarError("rfcTienda", "El RFC es requerido");
    } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc)) {
        mostrarError("rfcTienda", "El RFC debe tener un formato válido");
    } else {
        limpiarErrores();
    }
});

// Preview del logo con validación
document.getElementById("logoTienda").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        if (!tiposPermitidos.includes(file.type)) {
            alert("El archivo debe ser una imagen (JPEG, PNG, GIF o SVG)");
            e.target.value = "";
            return;
        }
        // Validar tamaño (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("El archivo no debe superar los 2MB");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewLogo = document.getElementById("previewLogo");
            previewLogo.innerHTML = `<img src="${e.target.result}" class="img-fluid" alt="Preview del logo">`;
        };
        reader.readAsDataURL(file);
    }
});

// Función para limpiar el formulario de empleado
function limpiarFormularioEmpleado() {
    document.getElementById("primer-nombre").value = "";
    document.getElementById("segundo-nombre").value = "";
    document.getElementById("primer-apellido").value = "";
    document.getElementById("segundo-apellido").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("puesto").value = "Empleado";
    document.getElementById("contrasena").value = "";
    document.getElementById("confirmar-contrasena").value = "";
    document.getElementById("contrasena-responsable").value = "";
    document.getElementById("contrasena-responsable-conf").value = "";
}

// Evento para el botón cancelar empleado
btnCancelarEmpleado.addEventListener("click", () => {
    const modalEmpleado = document.getElementById("alta-empleado");
    modalEmpleado.style.display = "none";
    limpiarFormularioEmpleado();
});

