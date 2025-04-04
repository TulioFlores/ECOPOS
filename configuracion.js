document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("modoOscuro");
    const body = document.body;
    const configContainer = document.querySelector(".config-container");

    // Verificar si hay una configuración guardada en localStorage
    if (localStorage.getItem("modoOscuro") === "activado") {
        activarModoOscuro();
        toggleSwitch.checked = true;
    }

    toggleSwitch.addEventListener("change", function () {
        if (this.checked) {
            activarModoOscuro();
            localStorage.setItem("modoOscuro", "activado");
        } else {
            desactivarModoOscuro();
            localStorage.setItem("modoOscuro", "desactivado");
        }
    });

    function activarModoOscuro() {
        body.style.backgroundColor = "#2c2c2c"; /* Fondo oscuro */
        configContainer.style.backgroundColor = "#3b3b3b"; /* Fondo de la caja de configuración */
        configContainer.style.color = "#ffffff"; /* Texto en blanco */
    }

    function desactivarModoOscuro() {
        body.style.backgroundColor = "#f4f4f4"; /* Vuelve al fondo claro */
        configContainer.style.backgroundColor = "#6D8BF4"; /* Vuelve al azul del diseño */
        configContainer.style.color = "white"; /* Vuelve al texto blanco */
    }
});
