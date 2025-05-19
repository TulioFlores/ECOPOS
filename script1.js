document.addEventListener('DOMContentLoaded', () => {
    console.log('Eco POS cargado correctamente.');
  
    // Ejemplo de funcionalidad futura
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
      feature.addEventListener('click', () => {
        alert('¡Haz clic en una funcionalidad de Eco POS!');
      });
    });
  });
  document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
  });