const userButtonControl = (user) => {
  // controller || button
  const toggleNotifications = document.getElementById('toggleNotifications');
  const toggleSettings = document.getElementById('toggleSettings');
  const toggleHelp = document.getElementById('toggleHelp');
  const toggleAdmin = user.isAdmin ? document.getElementById('toggleAdmin') : null; // Admin button

  const notificationsDiv = document.getElementById('notifications');
  const settingsDiv = document.getElementById('settings');
  const helpDiv = document.getElementById('help');
  const adminDiv = user.isAdmin ? document.getElementById('admin') : null; // Admin div

  const buttonCtlGroups = [
    { button: toggleNotifications, div: notificationsDiv },
    { button: toggleSettings, div: settingsDiv },
    { button: toggleHelp, div: helpDiv },
  ];

  if (user.isAdmin) {
    buttonCtlGroups.push({ button: toggleAdmin, div: adminDiv });
  }

  console.log('userButtonControl() ran');

  for (let i = 0; i < buttonCtlGroups.length; i++) {
    const btn = buttonCtlGroups[i].button;
    const div = buttonCtlGroups[i].div;

    // Check if both button and div are not null
    if (btn && div) {
      console.log(div);
      console.log(btn);
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
    }
  }
};

// Example usage: call the function with user object
const user = {
  isAdmin: true // Set to true if the user is an admin
};

userButtonControl(user);
