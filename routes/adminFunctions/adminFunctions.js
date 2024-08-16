function isAdmin(req, res, next) {
  const user = req.user;

  if (user && user.isAdmin) {
    console.log('ADMIN ACCESS: accessing admin routes: ' + user.displayName);
    next();
  } else {
    req.flash('error', 'Unauthorized. Please log in as an admin.');
    res.redirect('/');
  }
}

module.exports = { isAdmin };
