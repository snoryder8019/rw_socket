// observerCarrots.js

function observeCarrots() {
    const carrots = document.querySelectorAll('.carrot');
  
    console.log('Observing carrots:', carrots);
  
    if (!('IntersectionObserver' in window)) {
      carrots.forEach(carrot => {
        carrot.style.display = 'block';
        console.log('Fallback: Showing carrot:', carrot);
      });
      return;
    }
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.display = 'block';
          observer.unobserve(entry.target);
          console.log('Carrot is intersecting and shown:', entry.target);
        }
      });
    }, { threshold: 0.1 });
  
    carrots.forEach(carrot => {
      observer.observe(carrot);
      console.log('Observer attached to carrot:', carrot);
    });
  }
  
  window.observeCarrots = observeCarrots;  // Make sure this function is globally accessible
  