// Llama a la API y muestra los productos
async function cargarProductos() {
    try {
      const respuesta = await fetch('http://localhost:3000/productos');
      const productos = await respuesta.json();
      console.log(productos);
      productos.forEach(producto => {
        document.body.innerHTML += `
          <p>${producto.nombre} - $${producto.precio}</p>
        `;
      });
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }
  
  cargarProductos();
  