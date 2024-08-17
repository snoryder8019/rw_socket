
// public/javascripts/controllers/userControllers.js

const userButtonControl = (user) => {
  const toggleNotifications = document.getElementById('toggleNotifications');
  const toggleSettings = document.getElementById('toggleSettings');
  const toggleHelp = document.getElementById('toggleHelp');
  const toggleAdmin = user.isAdmin ? document.getElementById('toggleAdmin') : null;

  const notificationsDiv = document.getElementById('notifications');
  const settingsDiv = document.getElementById('settings');
  const helpDiv = document.getElementById('help');
  const adminDiv = user.isAdmin ? document.getElementById('admin') : null;

  const buttonCtlGroups = [
    { button: toggleNotifications, div: notificationsDiv },
    { button: toggleSettings, div: settingsDiv },
    { button: toggleHelp, div: helpDiv },
  ];

  if (user.isAdmin) {
    buttonCtlGroups.push({ button: toggleAdmin, div: adminDiv });
  }

  for (let i = 0; i < buttonCtlGroups.length; i++) {
    const btn = buttonCtlGroups[i].button;
    const div = buttonCtlGroups[i].div;

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
      console.log(` USER CTRL ~ Button or div missing: ${btn}, ${div}`);
    }
  }
};

// Example usage: call the function with a user object
const user = {
  isAdmin: true // Set to true if the user is an admin
};

userButtonControl(user);
