document.querySelector('#agregar-producto form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-producto').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const descripcion = document.getElementById('descripcion').value;

    const producto = {
      nombre,
      precio,
      stock,
      descripcion
    };

    try {
      const response = await fetch('http://localhost:3000/agregar-producto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Producto agregado con éxito. ID: ' + data.id);
        // Opcional: limpiar formulario
        e.target.reset();
      } else {
        alert('❌ Error: ' + data.mensaje);
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('❌ Ocurrió un error al conectar con el servidor.');
    }
  });