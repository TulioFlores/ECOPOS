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
function mostrarSugerencias(clientes) {
    const contenedor = document.getElementById('sugerencias-telefono');
    contenedor.innerHTML = ''; // Limpiar sugerencias anteriores

    clientes.forEach(cliente => {
        const item = document.createElement('div');
        item.classList.add('sugerencia-item');
        item.textContent = `${cliente.telefono} - ${cliente.nombre}`;

        item.addEventListener('click', () => {
            mostrarCliente(cliente); // Llenamos el input y nombre al hacer clic
            contenedor.innerHTML = ''; // Ocultamos sugerencias
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
