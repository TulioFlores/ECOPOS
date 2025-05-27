let scanner;
let scanning = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log("entra")
  const scanButton = document.getElementById("escanear");
  const inputField = document.getElementById("codigo-barras");
  const resultText = document.getElementById("result");
  const readerOverlay = document.getElementById("reader-overlay");
  const closeBtn = document.getElementById("close-scanner");

  // Crear el escáner una sola vez
  scanner = new Html5Qrcode("reader");

  async function iniciarEscaneo() {
    try {
      // Evita múltiples inicios
      if (scanning) return;

      readerOverlay.style.display = "flex";
      scanning = true;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 100 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.CODE_128
        ]
      };

      await scanner.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          if (!scanning) return;
          scanning = false;

          inputField.value = decodedText;
          resultText.innerText = "¡Código detectado!";

          if (navigator.vibrate) navigator.vibrate(100);

          try {
            await scanner.stop();
            await scanner.clear(); // Limpia el div internamente
          } catch (e) {
            console.warn("Error al detener o limpiar el escáner:", e);
          } finally {
            readerOverlay.style.display = "none";
          }
        },
        error => {
          // Ignorar errores de escaneo individuales
        }
      );
    } catch (error) {
      console.error("Error al iniciar el escáner:", error);
      scanning = false;
    }
  }

  async function detenerEscaneo() {
    scanning = false;
    try {
      await scanner.stop();
      await scanner.clear();
    } catch (e) {
      console.warn("Error al detener escáner:", e);
    } finally {
      readerOverlay.style.display = "none";
    }
  }

  scanButton.addEventListener("click", iniciarEscaneo);
  closeBtn.addEventListener("click", detenerEscaneo);
});
