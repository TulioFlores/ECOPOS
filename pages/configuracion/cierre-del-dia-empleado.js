document.addEventListener("DOMContentLoaded", function () {
    // Obtener elementos del DOM
    const fechaElement = document.querySelector(".fecha");
    const horaElement = document.querySelector(".hora");
    const botonCierre = document.getElementById("boton-cierre");
    const botonAplicarCierre = document.getElementById("aplicar-cierre");
    const botonSalir = document.querySelector(".btn-secondary");
    const modalAutenticacion = new bootstrap.Modal(document.getElementById('modal-autenticacion-corte'));
    const formAutenticacion = document.getElementById('form-autenticacion-corte');
    const mensajeAutenticacion = document.getElementById('mensajeAutenticacion');
    const cierreDelDia = document.getElementById('cierreDelDia');

    // Manejar el formulario de autenticación
    formAutenticacion.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuarioCorte').value;
        const contrasena = document.getElementById('contrasenaCorte').value;

        try {
            const response = await fetch('http://localhost:3000/autenticar-cajero', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, contrasena })
            });

            const data = await response.json();

            if (response.ok) {
                modalAutenticacion.hide();
                const bsCollapse = new bootstrap.Collapse(cierreDelDia);
                bsCollapse.show();
                mensajeAutenticacion.style.display = 'none';
            } else {
                mensajeAutenticacion.textContent = data.error || 'Error de autenticación';
                mensajeAutenticacion.className = 'alert alert-danger';
                mensajeAutenticacion.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            mensajeAutenticacion.textContent = 'Error al intentar autenticar';
            mensajeAutenticacion.className = 'alert alert-danger';
            mensajeAutenticacion.style.display = 'block';
        }
    });

    // Función para actualizar fecha y hora
    function actualizarFechaHora() {
        const ahora = new Date();
        fechaElement.textContent = ahora.toLocaleDateString();
        horaElement.textContent = ahora.toLocaleTimeString();
    }

    // Actualizar fecha y hora cada segundo
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);

    // Evento click en botón de cierre
    botonCierre.addEventListener("click", async function () {
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
            document.getElementById('mp-cierre').value = Number(data.total_mercado_pago || 0).toFixed(2);
            document.getElementById('monto-cierre').value = Number(data.total_general || 0).toFixed(2);

        } catch (error) {
            console.error(error);
            alert('Error al obtener los datos del cierre');
        }
    });

    // Evento click en botón aplicar cierre
    botonAplicarCierre.addEventListener("click", async function () {
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
                alert('Cierre registrado correctamente');
                const bsCollapse = new bootstrap.Collapse(cierreDelDia);
                bsCollapse.hide();
                document.getElementById('efectivo-cierre').value = null;
                document.getElementById('tarjeta-cierre').value = null;
                document.getElementById('mp-cierre').value = null;
                document.getElementById('monto-cierre').value = null;
            } else {
                alert(data.error || 'No se pudo registrar el cierre');
            }
        } catch (err) {
            console.error('Error en la solicitud:', err);
            alert('Error al conectar con el servidor');
        }
    });

    // Evento click en botón salir
    botonSalir.addEventListener("click", function () {
        const bsCollapse = new bootstrap.Collapse(cierreDelDia);
        bsCollapse.hide();
    });
}); 