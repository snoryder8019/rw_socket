import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';

export const authRouter = express.Router();

authRouter.use(bodyParser.urlencoded({ extended: true }));

authRouter.get('/auth/yahoo', passport.authenticate('yahoo'));

authRouter.get(
  '/auth/yahoo/callback',
  passport.authenticate('yahoo', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/');
  }
);

authRouter.post('/auth/local', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('info', info.message);
      const redirectUrl = req.headers.referer || '/';
      return res.redirect('/');
      // return res.send("email not registered")
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('info', info.message);

      // Redirect to the referring URL or a default route
      const redirectUrl = req.headers.referer || '/';
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
});
//////////console.log('findOne(): ')
authRouter.get('/auth/google', (req, res, next) => {
  req.session.redirectUrl = req.headers.referer || '/default-route';
  console.log(req.session.redirectUrl);
  passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    callbackURL: `/auth/google/callback`,
    failureRedirect: '/',
  })(req, res, next);
});

authRouter.get('/auth/google/callback', (req, res, next) => {
  const redirectUrl = req.session.redirectUrl;
  passport.authenticate(
    'google',
    {
      failureRedirect: '/',
    },
    (err, user) => {
      if (err) {
        return next(err);
      }
      if (user) {
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          req.flash('success', 'Successfully logged in');

          // Redirect to the referring URL or a default route
          return res.redirect(redirectUrl);
        });
      } else {
        // Handle the case when user is not authenticated
        return res.redirect('/');
      }
    }
  )(req, res, next);
});

authRouter.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

authRouter.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

authRouter.get('/logout', function (req, res, next) {
  const user = req.user;
  console.log(user);
  req.flash('info', 'logged out successfully');

  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('error', 'hmmm you didnt log out');
  });

  return res.redirect('/');
});
