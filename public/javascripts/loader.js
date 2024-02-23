// loader.js

// UI and other scripts managed here for simplicity wherever needed
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

const scriptsToLoad = [

  '/javascripts/controllers/buttonControl.js',
 
];

Promise.all(scriptsToLoad.map(loadScript))
  .then(() => {
    window.addEventListener('load', function() {
      document.body.style.display = 'block';
    });
    console.log('All scripts loaded');
    if (typeof logPos === 'function') {
      logPos();  // Call your function here
    }
    if (typeof warningLoader === 'function') {
      warningLoader();
     
  ;  // Call your function here
    }
  })
  .catch((error) => {
    console.error('Error loading scripts:', error);
  
  });
