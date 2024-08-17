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
  '/javascripts/controllers/userControllers.js',
  '/javascripts/controllers/backendControllers.js',
];

document.addEventListener('DOMContentLoaded', function() {
  Promise.all(scriptsToLoad.map(loadScript))
    .then(() => {
      window.addEventListener('load', function() {
        document.body.style.display = 'block';
      });
      console.log('All scripts loaded');

      // Check if the functions are defined before calling them
      if (typeof logPos === 'function') {
        logPos();  // Call your function here
      } else {
        console.log('logPos function did not load');
      }

      if (typeof warningLoader === 'function') {
        warningLoader();  // Call your function here
      } else {
        console.log('warningLoader function did not load');
      }

      if (typeof mainButtonControl === 'function') {
        mainButtonControl();
      } else {
        console.log('mainButtonControl did not load');
      }

      if (typeof userButtonControl === 'function') {
        const user = {
          isAdmin: true // Example user object, adjust based on your actual user data
        };
        userButtonControl(user);
      } else {
        console.log('userButtonControl did not load');
      }

      if (typeof backendButtonControl === 'function') {
        backendButtonControl();
      } else {
        console.log('backendControl did not load');
      }
    })
    .catch((error) => {
      console.error('Error loading scripts:', error);
    });
});

