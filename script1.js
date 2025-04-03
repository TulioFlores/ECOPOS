function mostrarExplicacion(tipo) {
    document.getElementById('ventana-' + tipo).style.display = 'block';
}

function cerrarVentana(id) {
    document.getElementById(id).style.display = 'none';
}

// Cerrar la ventana emergente si el usuario hace clic fuera de ella
window.onclick = function(event) {
    const ventanas = document.getElementsByClassName('ventana-emergente');
    for (let i = 0; i < ventanas.length; i++) {
        if (event.target == ventanas[i]) {
            ventanas[i].style.display = 'none';
        }
    }
}

// Simulación del conteo de usuarios registrados
document.addEventListener('DOMContentLoaded', () => {
    const usuariosRegistrados = 350; // Número simulado de usuarios registrados
    document.getElementById('usuarios-registrados').textContent = usuariosRegistrados;
});