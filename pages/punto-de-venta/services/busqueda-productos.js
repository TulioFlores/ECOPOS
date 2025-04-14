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