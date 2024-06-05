



const backendButtonControl= ()=> {
  //note
  //controller || button
  const toggleUsers = document.getElementById('toggleUsers');
  const toggleTicketsAdmin = document.getElementById('toggleTicketsAdmin');
  const toggleLogs = document.getElementById('toggleLogs');
  
  //div || window
  const usersDiv = document.getElementById('users');
  const ticketsAdminDiv = document.getElementById('ticketsAdmin');
  const logs = document.getElementById('logs')
  const buttonCtlGroups = [
    { button: toggleUsers, div:usersDiv  },
    { button: toggleTicketsAdmin, div:ticketsAdminDiv  },  
    { button: toggleLogs, div:logs  },
  
  ];
  console.log('backendButtonControl() ran');
  for (let i = 0; i < buttonCtlGroups.length; i++) {
    const btn = buttonCtlGroups[i].button;
    const div = buttonCtlGroups[i].div;
    console.log(div)
    console.log(btn)
    btn.addEventListener('click', function () {
      if (div.style.display === "block") {
        div.style.display = 'none';
      } else {
        for(let i =0;i<buttonCtlGroups.length;i++){
          buttonCtlGroups[i].div.style.display='none'
        }
                div.style.display = 'block';
      }
    });
  }
}
//document.addEventListener('onload', backendButtonControl())
//buttonControl();
