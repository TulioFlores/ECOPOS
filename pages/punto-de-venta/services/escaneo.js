  import { BrowserMultiFormatReader } from 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.0.10/+esm';

  const modalElement = document.getElementById('scannerModal');
  const container = document.getElementById('scanner-container');
  const productoInput = document.getElementById('producto');

  const codeReader = new BrowserMultiFormatReader();
  let stream = null;

  document.getElementById('escanear').addEventListener('click', async () => {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  });

  modalElement.addEventListener('shown.bs.modal', async () => {
    try {
      const result = await codeReader.decodeFromVideoDevice(null, container, (result, error, controls) => {
        if (result) {
          const codigo = result.getText();
          productoInput.value = codigo;

          // Detener escaneo
          controls.stop();
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal.hide();
        }
      });

      stream = result;
    } catch (err) {
      console.error("Error al iniciar ZXing:", err);
    }
  });

  modalElement.addEventListener('hidden.bs.modal', () => {
    codeReader.reset();
  });