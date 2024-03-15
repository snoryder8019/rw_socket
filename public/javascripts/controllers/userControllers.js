
const userButtonControl= ()=> {

//controller || button
const toggleNotifications = document.getElementById('toggleNotifications');
const toggleCart = document.getElementById('toggleCart');
const toggleRewards = document.getElementById('toggleRewards');
const toggleSettings = document.getElementById('toggleSettings');
const toggleSettings1 = document.getElementById('toggleSettings1');
const toggleHelp = document.getElementById('toggleHelp');


//div || window
const notificationsDiv = document.getElementById('notifications');
const cartDiv = document.getElementById('cart');
const rewardsDiv = document.getElementById('rewards');
const settingsDiv = document.getElementById('settings');
const helpDiv = document.getElementById('help');




const buttonCtlGroups = [
  { button: toggleNotifications, div:notificationsDiv  },
{button:toggleCart,div:cartDiv},
{button:toggleRewards,div:rewardsDiv},
{button:toggleSettings,div:settingsDiv},
{button:toggleSettings1,div:settingsDiv},
{button:toggleHelp,div:helpDiv},


];
//became unused
// function autoClose(){
//   for(let i =0;i<buttonCtlGroups.length;i++){
//     buttonCtlGroups[i].div.style.display="none"
//   }
// }
  console.log('userButtonControl() ran');
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

