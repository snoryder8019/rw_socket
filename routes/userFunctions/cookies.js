import express from 'express';
import cookieParser from 'cookie-parser';

const router = express.Router();

// Middleware to use cookieParser
router.use(cookieParser());

router.get('/', async (req, res, next) => {
  try {
    let visitCount = 0;
    if (req.cookies.visitCount) {
      visitCount = parseInt(req.cookies.visitCount) + 1;
    } else {
      visitCount = 1;
    }

    res.cookie('lastVisit', new Date().toISOString(), {
      maxAge: 900000,
      httpOnly: true,
    });
    res.cookie('visitCount', visitCount, { maxAge: 900000, httpOnly: true });

    const user = req.user;
    if (user) {
      console.log(`user: ${user.firstName}`);
      res.cookie('userName', user.firstName, {
        maxAge: 900000,
        httpOnly: true,
      });
    }

    // Move to the next middleware or response handler
    next();
  } catch (error) {
    console.error(error);
    next();
  }
});

export default router;
