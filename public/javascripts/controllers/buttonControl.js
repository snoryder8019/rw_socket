
// public/javascripts/controllers/buttonControl.js

const mainButtonControl = () => {
  const div0 = document.getElementById('div0');
  const toggleDiv = document.getElementById('toggleDiv');
  const login_div = document.getElementById('login_div');
  const reg_div = document.getElementById('register_div');
  const reg_ctrl = document.getElementById('reg_ctrl');
  const login_ctrl = document.getElementById('login_ctrl');

  const buttonCtlGroups = [
    { button: toggleDiv, div: div0 },
    { button: login_ctrl, div: login_div },
    { button: reg_ctrl, div: reg_div },
  ];

  for (let i = 0; i < buttonCtlGroups.length; i++) {
    const btn = buttonCtlGroups[i].button;
    const div = buttonCtlGroups[i].div;

    // Check if both button and div exist
    if (btn && div) {
      btn.addEventListener('click', function () {
        if (div.style.display === "block") {
          div.style.display = 'none';
        } else {
          for (let j = 0; j < buttonCtlGroups.length; j++) {
            if (buttonCtlGroups[j].div) {
              buttonCtlGroups[j].div.style.display = 'none';
            }
          }
          div.style.display = 'block';
        }
      });
    } else {
      console.log(`BUTTONCONTROL ~ Button or div missing: ${btn}, ${div}`);
    }
  }
};
