const toggleDiv = document.getElementById('toggleDiv');
const login_div = document.getElementById('login_div');
const reg_div = document.getElementById('register_div');
const reg_ctrl = document.getElementById('reg_ctrl');
const regClose = document.getElementById('regClose');
const loginClose = document.getElementById('loginClose');
const login_ctrl = document.getElementById('login_ctrl');


const div0 = document.getElementById('div0');



const clsoeCtlGroups = [
  { button: loginClose, div: login_div },
  { button: regClose, div: reg_div },

]

const buttonCtlGroups = [
  { button: toggleDiv, div: div0 },
  { button: login_ctrl, div: login_div },
  { button: reg_ctrl, div: reg_div },


];
function autoClose(){
  for(let i =0;i<buttonCtlGroups.length;i++){
    buttonCtlGroups[i].div.style.display="none"
  }
}

const buttonControl= ()=> {
  console.log('buttonControl() ran');
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
document.addEventListener('onload', buttonControl())
//buttonControl();

const closeControl= ()=> {
  console.log('closeControl() ran');
  for (let i = 0; i < closeCtlGroups.length; i++) {
    const btn = closeCtlGroups[i].button;
    const div = closeCtlGroups[i].div;
    console.log(div)
    console.log(btn)
    btn.addEventListener('click', function () {
   
        div.style.display = 'none';
   
    });
  }
}
document.addEventListener('onload', closeControl())
//buttonControl();
