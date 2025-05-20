document.addEventListener('DOMContentLoaded', () => {
    // Variables de estado
    let proveedores = [];
    let productos = [];
    let visitas = [];
    let editandoProveedor = false;
    const apiBaseUrl = 'http://localhost:3000/api';

    // Elementos del DOM
    const formProveedor = document.getElementById('registro-proveedor');
    const listaProveedores = document.getElementById('lista-proveedores');
    const tablaProductos = document.getElementById('tabla-productos');
    const tablaVisitas = document.getElementById('tabla-visitas');
    const selectProveedores = document.getElementById('visita-proveedor');
    const btnGuardarVisita = document.getElementById('btn-guardar-visita');

    // Inicializar la aplicación
    init();

    async function init() {
        await cargarProveedores();
        await cargarProductosBajoStock();
        await cargarVisitas();
        configurarEventos();
    }

    // Configurar eventos
    function configurarEventos() {
        // Validación en tiempo real para el nombre (solo letras y espacios)
        document.getElementById('nombre').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]/g, '');
        });

        // Validación en tiempo real para el teléfono (solo números)
        document.getElementById('telefono').addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
        });

        // Validación en tiempo real para productos (letras, números y algunos símbolos)
        document.getElementById('productos').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑüÜ0-9\s.,-]/g, '');
        });

        // Previsualización del logo
        document.getElementById('logo-url').addEventListener('input', function() {
            const url = this.value.trim();
            const preview = document.getElementById('logo-preview');
            
            if (url) {
                preview.innerHTML = `<img src="${url}" class="img-thumbnail" alt="Previsualización logo" onerror="this.parentElement.innerHTML=''">`;
            } else {
                preview.innerHTML = '';
            }
        });

        // Botón limpiar
        document.getElementById('btn-limpiar').addEventListener('click', limpiarFormularioProveedor);

        // Formulario proveedor
        formProveedor.addEventListener('submit', manejarSubmitProveedor);
        
        // Botones de acción
        document.getElementById('btn-modificar').addEventListener('click', modificarProveedor);
        document.getElementById('btn-eliminar').addEventListener('click', eliminarProveedor);
        
        // Visitas
        btnGuardarVisita.addEventListener('click', agregarVisita);

        // Validación de formularios al perder foco
        document.querySelectorAll('#registro-proveedor input, #registro-proveedor textarea').forEach(input => {
            input.addEventListener('blur', validarCampo);
        });

        document.querySelectorAll('#form-registro-visita input, #form-registro-visita select, #form-registro-visita textarea').forEach(input => {
            input.addEventListener('blur', validarCampoVisita);
        });
    }

    // Función para validar campos del formulario de proveedor
    function validarCampo(e) {
        const campo = e.target;
        if (campo.required && !campo.value.trim()) {
            campo.classList.add('is-invalid');
            return false;
        }

        if (campo.pattern) {
            const regex = new RegExp(campo.pattern);
            if (!regex.test(campo.value)) {
                campo.classList.add('is-invalid');
                return false;
            }
        }

        campo.classList.remove('is-invalid');
        return true;
    }

    // Función para validar campos del formulario de visita
    function validarCampoVisita(e) {
        const campo = e.target;
        if (campo.required && !campo.value.trim()) {
            campo.classList.add('is-invalid');
            return false;
        }

        // Validación especial para fecha (no puede ser anterior a hoy)
        if (campo.id === 'visita-fecha') {
            const hoy = new Date().toISOString().split('T')[0];
            if (campo.value < hoy) {
                campo.classList.add('is-invalid');
                campo.nextElementSibling.textContent = 'La fecha no puede ser anterior a hoy';
                return false;
            }
        }

        // Validación especial para hora (entre 8:00 y 18:00)
        if (campo.id === 'visita-hora') {
            const hora = parseInt(campo.value.split(':')[0]);
            if (hora < 8 || hora > 18) {
                campo.classList.add('is-invalid');
                campo.nextElementSibling.textContent = 'La hora debe estar entre 8:00 y 18:00';
                return false;
            }
        }

        campo.classList.remove('is-invalid');
        return true;
    }

    // Validar todo el formulario de proveedor
    function validarFormularioProveedor() {
        let valido = true;
        document.querySelectorAll('#registro-proveedor input[required], #registro-proveedor textarea[required]').forEach(campo => {
            if (!validarCampo({ target: campo })) {
                valido = false;
            }
        });
        return valido;
    }

    // Validar todo el formulario de visita
    function validarFormularioVisita() {
        let valido = true;
        document.querySelectorAll('#form-registro-visita input[required], #form-registro-visita select[required], #form-registro-visita textarea[required]').forEach(campo => {
            if (!validarCampoVisita({ target: campo })) {
                valido = false;
            }
        });
        return valido;
    }

    // Función para limpiar el formulario
    function limpiarFormularioProveedor() {
        formProveedor.reset();
        document.getElementById('proveedor-id').value = '';
        document.getElementById('logo-preview').innerHTML = '';
        
        // Remover clases de validación
        document.querySelectorAll('#registro-proveedor .is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        // Deshabilitar botones de modificar y eliminar
        document.getElementById('btn-modificar').classList.add('btn-disabled');
        document.getElementById('btn-eliminar').classList.add('btn-disabled');
        
        // Restaurar texto del botón principal
        document.querySelector('#registro-proveedor button[type="submit"]').textContent = 'Guardar';
        
        editandoProveedor = false;
    }

    // Cargar proveedores desde la API
    async function cargarProveedores() {
        try {
            const response = await fetch(`${apiBaseUrl}/proveedores`);
            if (!response.ok) throw new Error('Error al cargar proveedores');
            
            proveedores = await response.json();
            renderizarProveedores();
            llenarSelectProveedores();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar proveedores', 'danger');
        }
    }

    // Renderizar proveedores en cards
    function renderizarProveedores() {
        listaProveedores.innerHTML = '';
        
        proveedores.forEach(proveedor => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card h-100 proveedor-card" ondblclick="cargarProveedorEnFormulario(${proveedor.id_proveedor})">
                    ${proveedor.logo_url ? `<img src="${proveedor.logo_url}" class="card-img-top" alt="${proveedor.nombre}">` : 
                      '<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 150px;"><i class="bi bi-image text-muted" style="font-size: 3rem;"></i></div>'}
                    <div class="card-body">
                        <h5 class="card-title">${proveedor.nombre}</h5>
                        <p class="card-text"><i class="bi bi-envelope"></i> ${proveedor.correo}</p>
                        <p class="card-text"><i class="bi bi-telephone"></i> ${proveedor.telefono}</p>
                        ${proveedor.productos_principales ? `<p class="card-text"><small>${proveedor.productos_principales}</small></p>` : ''}
                    </div>
                </div>
            `;
            listaProveedores.appendChild(card);
        });
    }

    // Llenar select de proveedores para visitas
    function llenarSelectProveedores() {
        selectProveedores.innerHTML = '<option value="">Seleccione...</option>';
        proveedores.forEach(proveedor => {
            const option = document.createElement('option');
            option.value = proveedor.id_proveedor;
            option.textContent = proveedor.nombre;
            selectProveedores.appendChild(option);
        });
    }

    // Cargar productos bajo stock
    async function cargarProductosBajoStock() {
        try {
            const response = await fetch(`${apiBaseUrl}/productos/bajo-stock`);
            if (!response.ok) throw new Error('Error al cargar productos');
            
            productos = await response.json();
            renderizarProductos();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar productos', 'danger');
        }
    }

    // Renderizar productos en tabla
    function renderizarProductos() {
        tablaProductos.innerHTML = '';
        
        productos.forEach(producto => {
            const fila = document.createElement('tr');
            const estado = producto.stock <= (producto.stock_minimo * 0.3) ? 'danger' : 'warning';
            
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.nombre_proveedor}</td>
                <td>${producto.stock} / ${producto.stock_minimo}</td>
                <td><span class="badge bg-${estado}">${producto.stock <= (producto.stock_minimo * 0.3) ? 'Crítico' : 'Bajo'}</span></td>
            `;
            tablaProductos.appendChild(fila);
        });
    }

    // Cargar visitas desde la API
    async function cargarVisitas() {
        try {
            const response = await fetch(`${apiBaseUrl}/visitas`);
            if (!response.ok) throw new Error('Error al cargar visitas');
            
            visitas = await response.json();
            renderizarVisitas();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar visitas', 'danger');
        }
    }

    // Renderizar visitas en tabla
    function renderizarVisitas() {
        tablaVisitas.innerHTML = '';
        
        visitas.forEach(visita => {
            const fila = document.createElement('tr');
            const fecha = new Date(visita.fecha_visita).toLocaleDateString('es-ES');
            const hora = visita.hora_visita.substring(0, 5); // Formato HH:MM
            
            fila.innerHTML = `
                <td>${visita.nombre_proveedor}</td>
                <td>${fecha}</td>
                <td>${hora}</td>
                <td>${visita.motivo}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="cancelarVisita(${visita.id_visita})">
                        <i class="bi bi-x-circle"></i> Cancelar
                    </button>
                </td>
            `;
            tablaVisitas.appendChild(fila);
        });
    }

    // Manejar envío de formulario de proveedor
    async function manejarSubmitProveedor(e) {
        e.preventDefault();
        
        // Validar formulario antes de enviar
        if (!validarFormularioProveedor()) {
            mostrarAlerta('Por favor complete correctamente todos los campos requeridos', 'warning');
            return;
        }
        
        const idProveedor = document.getElementById('proveedor-id').value;
        const logoUrl = document.getElementById('logo-url').value;
        
        const proveedorData = {
            nombre: document.getElementById('nombre').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            productos_principales: document.getElementById('productos').value.trim(),
            logo_url: logoUrl.trim() || null  // Guardar null si no hay URL
        };

        try {
            const url = idProveedor ? `${apiBaseUrl}/proveedores/${idProveedor}` : `${apiBaseUrl}/proveedores`;
            const method = idProveedor ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(proveedorData)
            });
            
            if (!response.ok) throw new Error('Error al guardar proveedor');
            
            mostrarAlerta(`Proveedor ${idProveedor ? 'actualizado' : 'registrado'} correctamente`, 'success');
            limpiarFormularioProveedor();
            await cargarProveedores();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al guardar proveedor', 'danger');
        }
    }

    // Modificar proveedor
    async function modificarProveedor() {
        formProveedor.dispatchEvent(new Event('submit'));
    }

    // Eliminar proveedor
    async function eliminarProveedor() {
        const idProveedor = document.getElementById('proveedor-id').value;
        if (!idProveedor || !confirm('¿Está seguro de eliminar este proveedor?')) return;
        
        try {
            const response = await fetch(`${apiBaseUrl}/proveedores/${idProveedor}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Error al eliminar proveedor');
            
            mostrarAlerta('Proveedor eliminado correctamente', 'success');
            limpiarFormularioProveedor();
            await cargarProveedores();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al eliminar proveedor', 'danger');
        }
    }

    // Agregar nueva visita
    async function agregarVisita() {
        // Validar formulario antes de enviar
        if (!validarFormularioVisita()) {
            mostrarAlerta('Por favor complete correctamente todos los campos requeridos', 'warning');
            return;
        }

        const visitaData = {
            id_proveedor: selectProveedores.value,
            fecha_visita: document.getElementById('visita-fecha').value,
            hora_visita: document.getElementById('visita-hora').value,
            motivo: document.getElementById('visita-motivo').value.trim()
        };

        try {
            const response = await fetch(`${apiBaseUrl}/visitas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(visitaData)
            });
            
            if (!response.ok) throw new Error('Error al registrar visita');
            
            mostrarAlerta('Visita registrada correctamente', 'success');
            document.getElementById('form-registro-visita').reset();
            bootstrap.Modal.getInstance(document.getElementById('modalRegistroVisita')).hide();
            await cargarVisitas();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al registrar visita', 'danger');
        }
    }

    // Mostrar alerta
    function mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show fixed-top mx-auto mt-3`;
        alerta.style.maxWidth = '500px';
        alerta.style.zIndex = '1100';
        alerta.role = 'alert';
        alerta.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alerta);
        setTimeout(() => alerta.remove(), 5000);
    }

    // Funciones globales
    window.cargarProveedorEnFormulario = function(idProveedor) {
        const proveedor = proveedores.find(p => p.id_proveedor == idProveedor);
        if (!proveedor) return;
        
        document.getElementById('proveedor-id').value = proveedor.id_proveedor;
        document.getElementById('nombre').value = proveedor.nombre;
        document.getElementById('correo').value = proveedor.correo;
        document.getElementById('telefono').value = proveedor.telefono;
        document.getElementById('productos').value = proveedor.productos_principales || '';
        document.getElementById('logo-url').value = proveedor.logo_url || '';
        
        // Mostrar preview si hay logo
        if (proveedor.logo_url) {
            document.getElementById('logo-preview').innerHTML = 
                `<img src="${proveedor.logo_url}" class="img-thumbnail" alt="Logo ${proveedor.nombre}">`;
        }
        
        document.getElementById('btn-modificar').classList.remove('btn-disabled');
        document.getElementById('btn-eliminar').classList.remove('btn-disabled');
        document.querySelector('#registro-proveedor button[type="submit"]').textContent = 'Actualizar';
        
        editandoProveedor = true;
        document.getElementById('registro').scrollIntoView({ behavior: 'smooth' });
    };

    window.cancelarVisita = async function(idVisita) {
        if (!confirm('¿Está seguro de cancelar esta visita?')) return;
        
        try {
            const response = await fetch(`${apiBaseUrl}/visitas/${idVisita}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Error al cancelar visita');
            
            mostrarAlerta('Visita cancelada correctamente', 'success');
            await cargarVisitas();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cancelar visita', 'danger');
        }
    };
});