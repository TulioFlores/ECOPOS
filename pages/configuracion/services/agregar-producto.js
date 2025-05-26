// Agregar producto
document.querySelector('#form-producto').addEventListener('submit', async function (e) {
  e.preventDefault();

  const producto = obtenerDatosDelFormulario();

  const response = await fetch('/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });

  const data = await response.json();
  mostrarModal(response.ok ? '✅ Producto agregado: Código ' + data.codigo_barras : '❌ ' + data.mensaje);
  if (response.ok) e.target.reset();
});

// Buscar producto por código de barras
document.getElementById('btn-buscar-producto').addEventListener('click', async () => {
  const codigo = await mostrarPromptAsync({
    titulo: 'Buscar producto',
    mensaje: 'Ingrese el código de barras del producto a buscar:',
    tipo: 'text',
    obligatorio: false
  });

  if (codigo !== null) {
    console.log('Código ingresado:', codigo);
    // Aquí puedes hacer tu búsqueda con el código
  } else {
    console.log('El usuario canceló la búsqueda.');
  }

  if (!codigo) return;

  const res = await fetch(`/api/productos/${codigo}`);
  const data = await res.json();

  if (res.ok) {
    llenarFormulario(data);
    document.cookie = `producto_codigo=${codigo}; path=/`;
  } else {
    mostrarModal('❌ ' + data.mensaje);
  }
});

// Modificar producto por código de barras
document.getElementById('btn-modificar-producto').addEventListener('click', async () => {
  const codigo = obtenerCodigoDeCookie();
  if (!codigo) return alert('Primero busca un producto');

  const producto = obtenerDatosDelFormulario();

  const res = await fetch(`/api/productos/${codigo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });

  const data = await res.json();
  if (res.ok) {
    mostrarModal(data.mensaje);
    limpiarFormulario(); // ← aquí
  }

});

// Dar de baja producto
document.getElementById('btn-baja-producto').addEventListener('click', async () => {
  const codigo = obtenerCodigoDeCookie();
  if (!codigo || !confirm('¿Confirmas dar de baja este producto?')) return;

  const res = await fetch(`/api/productos/${codigo}/baja`, { method: 'PUT' });
  const data = await res.json();
  if (res.ok) {
    mostrarModal(data.mensaje);
    limpiarFormulario(); // ← aquí
  }
});

// Dar de alta producto
document.getElementById('btn-alta-producto').addEventListener('click', async () => {
  const codigo = obtenerCodigoDeCookie();
  if (!codigo || !confirm('¿Confirmas dar de alta este producto?')) return;

  const res = await fetch(`/api/productos/${codigo}/alta`, { method: 'PUT' });
  const data = await res.json();
  if (res.ok) {
    mostrarModal(data.mensaje);
    limpiarFormulario(); // ← aquí
  }
});

// Utilidades
function obtenerDatosDelFormulario() {
  return {
    codigo_barras: document.getElementById('codigo-barras').value,
    nombre: document.getElementById('nombre-producto').value,
    descripcion: document.getElementById('descripcion').value,
    precio: parseFloat(document.getElementById('precio').value),
    stock: parseInt(document.getElementById('stock').value),
    stock_minimo: parseInt(document.getElementById('stock-minimo').value),
    id_proveedor: parseInt(document.getElementById('id-proveedor').value) || null
  };
}

function llenarFormulario(producto) {
  document.getElementById('codigo-barras').value = producto.codigo_barras;
  document.getElementById('nombre-producto').value = producto.nombre;
  document.getElementById('precio').value = producto.precio;
  document.getElementById('stock').value = producto.stock;
  document.getElementById('descripcion').value = producto.descripcion || '';
  document.getElementById('stock-minimo').value = producto.stock_minimo || 0;
  document.getElementById('id-proveedor').value = producto.id_proveedor || '';
}

function obtenerCodigoDeCookie() {
  const match = document.cookie.match(/producto_codigo=([^;]+)/);
  return match ? match[1] : null;
}
function limpiarFormulario() {
  document.getElementById('form-producto').reset();

  // También puedes limpiar manualmente los inputs si los manejas individualmente
  document.cookie = 'producto_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
  function mostrarModal(mensaje) {
    const modalBody = document.getElementById('modalMensajeBody');
    modalBody.innerHTML = mensaje;
  
    const modal = new bootstrap.Modal(document.getElementById('modalMensaje'));
    modal.show();
  }

function mostrarPromptAsync({ 
  titulo = 'Ingrese un valor', 
  mensaje = '', 
  tipo = 'text', 
  obligatorio = true 
}) {
  return new Promise((resolve, reject) => {
    document.getElementById('modalPromptLabel').innerText = titulo;
    document.getElementById('modalPromptMensaje').innerText = mensaje;

    const input = document.getElementById('modalPromptInput');
    const error = document.getElementById('modalPromptError');
    input.type = tipo;
    input.value = '';
    error.classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('modalPrompt'));
    const btnAceptar = document.getElementById('btnPromptAceptar');
    const btnCancelar = document.getElementById('btnPromptCancelar');

    // Limpia eventos anteriores
    btnAceptar.onclick = () => {
      const valor = input.value.trim();

      if (obligatorio && valor === '') {
        error.textContent = 'Este campo es obligatorio.';
        error.classList.remove('d-none');
        input.focus();
        return;
      }

      if (tipo === 'number' && isNaN(valor)) {
        error.textContent = 'Debe ingresar un número válido.';
        error.classList.remove('d-none');
        input.focus();
        return;
      }

      modal.hide();
      resolve(tipo === 'number' ? Number(valor) : valor);
    };

    btnCancelar.onclick = () => {
      modal.hide();
      resolve(null); // O puedes usar reject() si quieres diferenciar cancelación
    };

    modal.show();
    setTimeout(() => input.focus(), 300);
  });
}
async function buscarProducto() {
  
}
