document.getElementById('cliente').addEventListener('keypress', async (event) => {
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
            const response = await fetch(`http://localhost:3000/cliente/${telefono}`,{
                credentials: 'include',
            });
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            
            
            const data = await response.json(); 
            console.log('Datos recibidos desde el servidor:', data);

            // Llamamos a la función para mostrar los resultados
            mostrarCliente(data);
        } catch (error) {
            console.error('Hubo un problema con la solicitud:', error);
        }
    }
});
function mostrarCliente(cliente){
    const nombre = document.getElementById("nombre-cliente");
    const telefono = document.getElementById("cliente");
    nombre.innerText = cliente.nombre;
    telefono.value = cliente.telefono;
}
document.getElementById('cliente').addEventListener('input', () => {
    const telefono = document.getElementById("cliente").value.trim();
    if (telefono === '') {
        document.getElementById("nombre-cliente").innerText = '';
    }
});
function mostrarSugerencias(clientes) {
    const contenedor = document.getElementById('sugerencias-telefono');
    contenedor.style.display="flex";
    contenedor.innerHTML = ''; // Limpiar sugerencias anteriores

    clientes.forEach(cliente => {
        const item = document.createElement('div');
        item.classList.add('sugerencia-item');
        item.textContent = `${cliente.telefono} - ${cliente.nombre}`;

        item.addEventListener('click', () => {
            mostrarCliente(cliente); // Llenamos el input y nombre al hacer clic
            contenedor.innerHTML = ''; // Ocultamos sugerencias
            contenedor.style.display="none";
        });

        contenedor.appendChild(item);
    });
}
document.getElementById('cliente').addEventListener('input', async (event) => {
    const telefono = event.target.value.trim();
    
    if (telefono.length === 0) {
        document.getElementById('sugerencias-telefono').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/clientes/sugerencias/${telefono}`);
        if (!response.ok) throw new Error('Error en la búsqueda de sugerencias');
        const sugerencias = await response.json();

        mostrarSugerencias(sugerencias);
    } catch (error) {
        console.error('Error al obtener sugerencias:', error);
    }
});


// Botones
btnConfirmarCliente = document.getElementById("btn-confirmar-cliente");
btnCancelarCliente = document.getElementById("btn-cancelar-cliente");

// Función para validar el correo electrónico
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para validar el teléfono
function validarTelefono(telefono) {
    const regex = /^\d{10}$/;
    return regex.test(telefono);
}

// Función para validar el nombre
function validarNombre(nombre) {
    return nombre.length >= 3 && nombre.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
}

// Función para mostrar mensaje de error en el modal
function mostrarErrorEnModal(mensaje) {
    const errorDiv = document.getElementById('error-mensaje');
    if (!errorDiv) {
        const div = document.createElement('div');
        div.id = 'error-mensaje';
        div.className = 'alert alert-danger mt-3';
        div.style.display = 'block';
        document.querySelector('.nuevo-cliente').insertBefore(div, document.querySelector('.row.d-flex.align-items-center.justify-content-center'));
    }
    document.getElementById('error-mensaje').textContent = mensaje;
}

// Función para limpiar mensaje de error
function limpiarError() {
    const errorDiv = document.getElementById('error-mensaje');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Función para registrar cliente
btnConfirmarCliente.addEventListener("click", async () => {
    const nombre = document.getElementById("nuevo-cliente-nombre").value.trim();
    const telefono = document.getElementById("telefono-cliente").value.trim();
    const correo = document.getElementById("correo-cliente").value.trim();

    // Limpiar mensajes de error anteriores
    limpiarError();

    // Validaciones
    if (!nombre || !telefono || !correo) {
        mostrarErrorEnModal("Por favor complete todos los campos.");
        return;
    }

    if (!validarNombre(nombre)) {
        mostrarErrorEnModal("El nombre debe contener solo letras y espacios, entre 3 y 50 caracteres.");
        return;
    }

    if (!validarTelefono(telefono)) {
        mostrarErrorEnModal("El teléfono debe contener exactamente 10 dígitos numéricos.");
        return;
    }

    if (!validarEmail(correo)) {
        mostrarErrorEnModal("Por favor ingrese un correo electrónico válido.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre_completo: nombre,
                telefono: telefono,
                correo: correo
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito
            const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success mt-3';
            successDiv.textContent = "Cliente registrado exitosamente.";
            document.querySelector('.nuevo-cliente').insertBefore(successDiv, document.querySelector('.row.d-flex.align-items-center.justify-content-center'));
            
            // Limpiar campos
            document.getElementById("nuevo-cliente-nombre").value = "";
            document.getElementById("telefono-cliente").value = "";
            document.getElementById("correo-cliente").value = "";

            // Remover mensaje de éxito después de 2 segundos
            setTimeout(() => {
                successDiv.remove();
            }, 2000);
        } else {
            mostrarErrorEnModal("Error: " + data.error);
        }

    } catch (error) {
        console.error("Error al registrar cliente:", error);
        mostrarErrorEnModal("Error de conexión con el servidor.");
    }
});

// Cancelar: Limpiar los campos y mensajes
btnCancelarCliente.addEventListener("click", () => {
    document.getElementById("nuevo-cliente-nombre").value = "";
    document.getElementById("telefono-cliente").value = "";
    document.getElementById("correo-cliente").value = "";
    limpiarError();
});

// Validación en tiempo real
document.getElementById("nuevo-cliente-nombre").addEventListener("input", (e) => {
    const nombre = e.target.value.trim();
    if (nombre && !validarNombre(nombre)) {
        mostrarErrorEnModal("El nombre debe contener solo letras y espacios, entre 3 y 50 caracteres.");
    } else {
        limpiarError();
    }
});

document.getElementById("telefono-cliente").addEventListener("input", (e) => {
    const telefono = e.target.value.trim();
    if (telefono && !validarTelefono(telefono)) {
        mostrarErrorEnModal("El teléfono debe contener exactamente 10 dígitos numéricos.");
    } else {
        limpiarError();
    }
});

document.getElementById("correo-cliente").addEventListener("input", (e) => {
    const correo = e.target.value.trim();
    if (correo && !validarEmail(correo)) {
        mostrarErrorEnModal("Por favor ingrese un correo electrónico válido.");
    } else {
        limpiarError();
    }
});
