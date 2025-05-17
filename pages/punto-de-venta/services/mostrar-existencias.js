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
  

  //Imprimir existencias
   document.getElementById('btn-imprimir-existencias').addEventListener('click', async () => {
    try {
      const response = await fetch('/productos');
      const productos = await response.json();

      // Llenar la tabla
      const tbody = document.getElementById('contenido-tabla-pdf');
      tbody.innerHTML = ''; // Limpiar por si ya se generó antes

      productos.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${p.clave || ''}</td>
          <td>${p.descripcion || ''}</td>
          <td>${p.stock || 0}</td>
          <td>${p.precio || 0}</td>
        `;
        tbody.appendChild(row);
      });

      // Mostrar temporalmente el contenido para convertirlo en PDF
      const contenido = document.getElementById('contenido-pdf');
      contenido.style.display = 'block';

      // Generar PDF
      await html2pdf().set({
        margin: 10,
        filename: 'existencias.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(contenido).save();

      // Ocultar nuevamente
      contenido.style.display = 'none';

    } catch (err) {
      console.error('Error al generar el PDF:', err);
      alert('Hubo un problema al generar el PDF.');
    }
  });