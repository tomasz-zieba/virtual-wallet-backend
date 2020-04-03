const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.getCategories = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user.');
      error.statusCode = 404;
      throw error;
    }
    res.status(201).json({
      message: 'Categories fetched succesfully!',
      incomeCategories: user.operationsCategories.income,
      expensCategories: user.operationsCategories.expense,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Category already exists.');
    error.statusCode = 422;
    error.msg = errors.msg;
    throw error;
  }
  const { userId } = req;
  const { categoryName } = req.body;
  const { operationType } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user.');
      error.statusCode = 404;
      throw error;
    }
    await user.addCategory(categoryName, operationType);
    res.status(201).json({
      message: 'Category fetched succesfully!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const { userId } = req;
  const categoryNames = req.body.categoryNamesList;
  const { operationType } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user.');
      error.statusCode = 404;
      throw error;
    }
    await user.removeCategory(categoryNames, operationType);
    res.status(201).json({
      message: 'Category deleted succesfully!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
