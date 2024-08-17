
// public/javascripts/controllers/backendControllers.js

const backendButtonControl = () => {
  const toggleUsers = document.getElementById('toggleUsers');
  const toggleTicketsAdmin = document.getElementById('toggleTicketsAdmin');
  const toggleLogs = document.getElementById('toggleLogs');

  const usersDiv = document.getElementById('users');
  const ticketsAdminDiv = document.getElementById('ticketsAdmin');
  const logs = document.getElementById('logs');

  const buttonCtlGroups = [
    { button: toggleUsers, div: usersDiv },
    { button: toggleTicketsAdmin, div: ticketsAdminDiv },
    { button: toggleLogs, div: logs },
  ];

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
      console.log(`BACKENDCONTROLLERS ~ Button or div missing: ${btn}, ${div}`);
    }
  }
};
