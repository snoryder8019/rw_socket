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
  '/javascripts/controllers/backendControllers.js',
  '/javascripts/controllers/userControllers.js',

];
document.addEventListener('DOMContentLoaded', function() {
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
  if(typeof mainButtonControl ===  'function'){
    mainButtonControl();
  }else{
    console.log(`mainButtonControl did not load`)
  };
    }
    if(typeof userButtonControl ===  'function'){
      userButtonControl();
    }else{
      console.log(`userButtonControl did not load`)
    };

    // if(typeof closeControl ===  'function'){
    //   closeControl();

    // }else{
    //   console.log(`closeControl did not load`)
    // };


    if(typeof backendControl ===  'function'){
      backendControl();
    }else{
      console.log(`backendControl did not load`)
    };

  })
  .catch((error) => {
    console.error('Error loading scripts:', error);

  });
  });
