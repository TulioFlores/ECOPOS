// formulario.js
document.addEventListener('DOMContentLoaded', function () {
    const productoInput = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
    const clienteInput = document.getElementById('cliente');
    const enterButton = document.getElementById('enter');

    productoInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            cantidadInput.focus();
            cantidadInput.select();
        }
    });

    cantidadInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            enterButton.focus();
        }
    });
});

