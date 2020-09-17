const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secret;
const User = require('../../model/User');

/*
 * @route POST api/users/register
 * @desc Register the user
 * @access Public
 */
router.post('/register', async (req, res) => {
  let { name, username, email, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    return res.status(400).json({
      msg: 'Password do not match.',
    });
  }

  // Check for the unique username

  await User.findOne({ username: username }).then((user) => {
    if (user && !res.headersSent) {
      return res
        .status(400)
        .jsonp({
          msg: 'Username already exists.',
        })
        .end();
    }
  });
  // Check for the unique email
  await User.findOne({ email: email }).then((user) => {
    if (user && !res.headersSent) {
      return res
        .status(400)
        .jsonp({
          msg: 'Email is already registered. Did you forget your password?',
        })
        .end();
    }
  });
  // The data is valid and user will be registered
  if (res.headersSent == false) {
    let newUser = new User({
      name,
      username,
      password,
      email,
    });
    // Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then((user) => {
          return res
            .status(201)
            .jsonp({
              success: true,
              msg: 'User is now registered.',
            })
            .end();
        });
      });
    });
  }
});

/*
 * @route Get api/users/login
 * @desc Signing in the User
 * @access Public
 */

router.post('/login', async (req, res) => {
  await User.findOne({ username: req.body.username }).then((user) => {
    if (!user && !res.headersSent) {
      return res
        .status(404)
        .jsonp({
          msg: 'Username is not found.',
          success: false,
        })
        .end();
    }
    // Compare the password
    bcrypt.compare(req.body.password, user.password).then((isMatch) => {
      if (isMatch && !res.headersSent) {
        // Users password match, send JSON token for that user.
        const payload = {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
        };
        jwt.sign(
          payload,
          key,
          {
            expiresIn: 604800,
          },
          (err, token) => {
            res
              .status(200)
              .jsonp({
                success: true,
                token: `Bearer ${token}`,
                msg: 'You have successfully logged in',
              })
              .end();
          }
        );
      } else {
        return res
          .status(404)
          .jsonp({
            msg: 'Incorrect password',
            success: false,
          })
          .end();
      }
    });
  });
});

/*
 * @route POST api/users/profile
 * @desc Return the users data
 * @access Private
 */

router.get(
  '/profile',
  passport.authenticate('jwt', {
    session: false,
  }),
  (req, res) => {
    return res
      .jsonp({
        user: req.user,
      })
      .end();
  }
);

module.exports = router;
