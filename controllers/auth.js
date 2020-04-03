
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.msg = errors.msg;
    throw error;
  }
  const { name } = req.body;
  const { password } = req.body;
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      password: hashedPw,
      name,
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.login = async (req, res, next) => {
  const { password } = req.body;
  const { name } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) {
      const error = new Error('A user with this name not found.');
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        name: user.name,
        userId: user._id.toString(),
      },
      'secret',
      { expiresIn: '1h' },
    );
    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
