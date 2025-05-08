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
            const response = await fetch(`http://localhost:3000/cliente/${telefono}`);
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            
            
            const data = await response.json(); 
            if (!data.error) {
                localStorage.setItem('id_cliente', data.id_cliente,);  // debes retornar id_cliente en el backend
                localStorage.setItem('nom_cliente', data.nombre);  // debes retornar id_cliente en el backend
            }
            console.log('Datos recibidos desde el servidor:', data);

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

// Función para registrar cliente
btnConfirmarCliente.addEventListener("click", async () => {
    const nombre = document.getElementById("nuevo-cliente-nombre").value.trim();
    const telefono = document.getElementById("telefono-cliente").value.trim();
    const correo = document.getElementById("correo-cliente").value.trim();

    if (!nombre || !telefono || !correo) {
        mostrarAlerta("Por favor llena todos los campos.");
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
            mostrarAlerta("Cliente registrado exitosamente.");
            // Limpiar campos
            document.getElementById("nuevo-cliente-nombre").value = "";
            document.getElementById("telefono-cliente").value = "";
            document.getElementById("correo-cliente").value = "";
        } else {
            mostrarAlerta("Error: " + data.error);
        }

    } catch (error) {
        console.error("Error al registrar cliente:", error);
        mostrarAlerta("Error de conexión con el servidor.");
    }
});


// Cancelar: Limpiar los campos
btnCancelarCliente.addEventListener("click", () => {
    document.getElementById("nuevo-cliente-nombre").value = "";
    document.getElementById("telefono-cliente").value = "";
    document.getElementById("correo-cliente").value = "";
});
