export function isAdmin(req, res, next) {
  let user = req.user;
  console.log('ADMIN ACCESS: accessing admin routes: ' + user.displayName);

  if (user && user.isAdmin) {
    next();
  } else {
    req.flash('error', 'Unauthorized. Please log in as an admin.');
    res.redirect('/');
  }
}
//use of flash and lib
//  lib('card updated:', 'no errors from lib():', { cardID,userName }, 'cards.json','data');
// req.flash('success', 'Card updated successfully.');
