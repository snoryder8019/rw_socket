const toggleDiv = document.getElementById('toggleDiv');


const div0 = document.getElementById('div0');



const buttonCtlGroups = [
  { button: toggleDiv, div: div0 },


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
