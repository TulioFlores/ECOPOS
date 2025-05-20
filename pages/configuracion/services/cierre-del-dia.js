import { cerrarSidebar } from './reportes.js';
import { cerrarTodosLosModales } from './reportes.js';
import { resaltarActivo} from './reportes.js';

//Funcion para ocultar o abrir
function abrirCollapse(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const instance = bootstrap.Collapse.getOrCreateInstance(el);
  instance.show();
}

export function cerrarCollapse(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const instance = bootstrap.Collapse.getInstance(el);
  if (instance) {
    instance.hide();
  }
}




document.getElementById('boton-cierre').addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/resumen-dia', {
      method: 'POST'
    });

    const data = await response.json();
    console.log(data);
    if (data.error) {
      alert(data.error);
      return;
    }

    document.getElementById('efectivo-cierre').value = Number(data.efectivo || 0).toFixed(2);
    document.getElementById('tarjeta-cierre').value = Number(data.tarjeta || 0).toFixed(2);
    document.getElementById('mp-cierre').value = Number(data.mercado_pago || 0).toFixed(2);
    document.getElementById('monto-cierre').value = Number(data.total || 0).toFixed(2);


  } catch (error) {
    console.error(error);
    alert('Error al obtener los datos del cierre');
  }
});

 document.getElementById('aplicar-cierre').addEventListener('click', async () => {
    // Obtener valores desde los inputs
    const efectivo = parseFloat(document.getElementById('efectivo-cierre').value) || 0;
    const tarjeta = parseFloat(document.getElementById('tarjeta-cierre').value) || 0;
    const mp = parseFloat(document.getElementById('mp-cierre').value) || 0;
    const total = parseFloat(document.getElementById('monto-cierre').value) || 0;

    // Aquí puedes definir cómo se calcula faltante o sobrante si aplica, por ahora asumimos 0
    const faltante = 0;
    const sobrante = 0;

    const montoCorrecto = efectivo + tarjeta + mp; // o usa `total` directamente si ya está calculado
    const id_empleado = localStorage.getItem('id_empleado') || 2; // Ajusta según cómo manejas al usuario logueado
    try {
      const response = await fetch('http://localhost:3000/api/aplicar-cierre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          faltante,
          sobrante,
          montoCorrecto,
          id_empleado
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Cierre registrado correctamente');
        cerrarCollapse("cierreDelDia");
        document.getElementById('efectivo-cierre').value = null;
        document.getElementById('tarjeta-cierre').value = null;
        document.getElementById('mp-cierre').value = null;
        document.getElementById('monto-cierre').value = null;
      } else {
        alert(`❌ Error: ${data.error || 'No se pudo registrar el cierre'}`);
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
      alert('❌ Error al conectar con el servidor');
    }
  });

  document.getElementById('form-autenticacion-corte').addEventListener('submit', async function (e) {
    e.preventDefault();
    cerrarSidebar();
    cerrarTodosLosModales();
    const usuario = document.getElementById('usuarioCorte').value;
    const contrasena = document.getElementById('contrasenaCorte').value;
  
    try {
      const res = await fetch('http://localhost:3000/autenticar-cajero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
      });
  
      const data = await res.json();
  
      if (data.success) {
        // Cerrar el modal de autenticación si está abierto
        
        const modalAutenticacion = bootstrap.Modal.getInstance(document.getElementById('modal-autenticacion-corte'));
        if (modalAutenticacion) modalAutenticacion.hide();
        // Abrir el modal de cierre del dia
        abrirCollapse("cierreDelDia");
        resaltarActivo("boton-cierre-del-dia");
      } else {
        alert(data.error || 'Error al autenticar');
      }
  
  
    } catch (error) {
      console.error('Error en la autenticación', error);
      alert('Error de conexión');
    }
  });