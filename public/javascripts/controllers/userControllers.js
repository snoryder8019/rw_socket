
const userButtonControl= ()=> {

//controller || button
const toggleNotifications = document.getElementById('toggleNotifications');
const toggleCart = document.getElementById('toggleCart');
const toggleRewards = document.getElementById('toggleRewards');
const toggleSettings = document.getElementById('toggleSettings');
const toggleHelp = document.getElementById('toggleHelp');
const toggleAdmin = document.getElementById('toggleAdmin');
//const toggleWallet = document.getElementById('toggleWallet');

//div || window
const notificationsDiv = document.getElementById('notifications');
const cartDiv = document.getElementById('cart');
const rewardsDiv = document.getElementById('rewards');
const settingsDiv = document.getElementById('settings');
const helpDiv = document.getElementById('help');
const adminDiv = document.getElementById('admin');
//const walletDiv = document.getElementById('wallet');



const buttonCtlGroups = [
  { button: toggleNotifications, div:notificationsDiv  },
{button:toggleCart,div:cartDiv},
{button:toggleRewards,div:rewardsDiv},
{button:toggleSettings,div:settingsDiv},
{button:toggleHelp,div:helpDiv},
{button:toggleAdmin,div:adminDiv},
//{button:toggleWallet,div:walletDiv}

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

