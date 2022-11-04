const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  const { email, username, password, first_name, last_name } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) return res.status(403).json({ error: 'Email already in use' });
  } catch (err) {
    if (err) {
      return next(err);
    }
  }
  try {
    const user = await User.findOne({ username });
    if (user) return res.status(403).json({ error: 'Username already in use' });
  } catch (err) {
    if (err) {
      return next(err);
    }
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(password, salt, (err, hashedPassword) => {
      if (err) return next(err);
      const newUser = new User({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
      });
      newUser.save((err, data) => {
        if (err) return next(err);

        const token = jwt.sign(
          { sub: data._id, iss: 'mended' },
          process.env.SECRET_KEY
        );

        res.json({ token });
      });
    });
  });
};

exports.login = async (req, res, next) => {
  const { email, username, password } = req.body;
  let loginMethod = {};
  // console.log('header', JSON.stringify(req.headers));
  if (email) {
    loginMethod = { email: email };
  } else if (username) {
    loginMethod = { username: username };
  }

  try {
    const user = await User.findOne(loginMethod);
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return next(err);
        if (result) {
          const token = jwt.sign(
            { sub: user._id, iss: 'mended' },
            process.env.SECRET_KEY
          );
          // console.log(
          //   'the userstoken',
          //   jwt.verify(token, process.env.SECRET_KEY).sub
          // );
          const { password, ...userDetails } = user.toObject();
          return res.json({
            message: 'Succesful login',
            token,
            user: userDetails,
          });
        }
        return res.json({ message: 'Password not correct' });
      });
    }
    if (!user) {
      return res.json({ message: 'User not found' });
    }
  } catch (err) {
    return next(err);
  }
};
