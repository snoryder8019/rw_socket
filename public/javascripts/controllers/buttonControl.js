const mainButtonControl= ()=> {  
  const div0 = document.getElementById('div0');
  const toggleDiv = document.getElementById('toggleDiv');
  const login_div = document.getElementById('login_div');
  const reg_div = document.getElementById('register_div');
  const reg_ctrl = document.getElementById('reg_ctrl');
 // const tickets = document.getElementById('tickets');
  const login_ctrl = document.getElementById('login_ctrl');
  const buttonCtlGroups = [
    { button: toggleDiv, div: div0 },
    { button: login_ctrl, div: login_div },
    { button: reg_ctrl, div: reg_div },   
  ];
 // console.log('mainButtonControl() ran');
  for (let i = 0; i < buttonCtlGroups.length; i++) {
    const btn = buttonCtlGroups[i].button;
    const div = buttonCtlGroups[i].div;
    //console.log(div)
    //console.log(btn)
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
//document.addEventListener('onload', buttonControl())
//buttonControl();

const closeControl= ()=> {
  const tickets_ctrl = document.getElementById('tickets_ctrl');
  const regClose = document.getElementById('regClose');
  const loginClose = document.getElementById('loginClose');
 // console.log('closeControl() ran');
  const closeCtlGroups = [
    { button: loginClose, div: login_div },
    { button: regClose, div: reg_div },
   // { button:tickets_ctrl , div: tickets },
    
  ]
  for (let i = 0; i < closeCtlGroups.length; i++) {
    const btn = closeCtlGroups[i].button;
    const div = closeCtlGroups[i].div;
    //console.log(div)
    //console.log(btn)
    btn.addEventListener('click', function () {
      
      div.style.display = 'none';
      
    });
  }
}
//document.addEventListener('onload', closeControl())
//buttonControl();
