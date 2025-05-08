// Abrir modal al hacer clic en el botón
document.getElementById("boton-existencias").addEventListener("click", () => {
    fetch("http://localhost:3000/productos")
      .then(res => res.json())
      .then(productos => {


        const tbody = document.getElementById("tabla-existencias");
        productos.forEach(producto => {
            // Crear la fila
            const fila = document.createElement('tr');
            fila.classList.add('row');
            fila.innerHTML = `
                <td class="col-3 text-center">${producto.id_producto}</td>
                <td class="col-3 text-center col-nombre">${producto.nombre}</td>
                <td class="col-3 text-center col-cantidad">${producto.stock}</td>
                <td class="col-3 text-center col-total">$${producto.precio}</td>
            `;
        
        tbody.appendChild(fila);
        });
        document.getElementById("existencias").style.display = "block";
      })
      .catch(err => {
        alert("Error al obtener productos");
        console.error(err);
      });
  });
  
  // Cerrar modal
  document.getElementById("btn-cancelar-existencias").addEventListener("click", () => {
    document.getElementById("existencias").style.display = "none";
  });
  