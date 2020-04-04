const { validationResult } = require('express-validator');
const User = require('../models/user');
const Wallet = require('../models/wallet');

exports.getWallets = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    await user.populate('wallets.walletId').execPopulate();
    res.status(201).json({
      message: 'Wallets fetched succesfully!',
      wallets: user.wallets,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getWallet = async (req, res, next) => {
  const { walletId } = req.params;
  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      const error = new Error('Could not find wallet.');
      error.statusCode = 404;
      throw error;
    }
    if (wallet.creator._id.toString() !== req.userId) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }
    res.status(200).json({ message: 'Wallet fetched', wallet });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.newWallet = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error();
      error.statusCode = 422;
      error.msg = errors.msg;
      throw error;
    }
    const { title } = req.body;
    const { startDate } = req.body;
    const { endDate } = req.body;
    const creator = req.userId;
    const wallet = new Wallet({
      title,
      startDate,
      endDate,
      incomes: [],
      expenses: [],
      creator,
    });
    await wallet.save();
    const user = await User.findById(req.userId);
    await user.addWallet(wallet);
    res.status(201).json({
      message: 'Wallet created successfully!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addToFavourites = async (req, res, next) => {
  const { walletId } = req.params;
  try {
    const wallet = await Wallet.findById(walletId);
    await wallet.addToFavourites();
    const user = await User.findById(req.userId);
    if (!walletId) {
      const error = new Error('Could not find wallet or user.');
      error.statusCode = 404;
      throw error;
    }
    await user.addToFavourites(wallet);
    res.status(201).json({
      message: 'Wallet added to favourites succesfully!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.removeFromFavourites = async (req, res, next) => {
  const { walletId } = req.params;
  try {
    const wallet = await Wallet.findById(walletId);
    await wallet.removeFromFavourites();
    const user = await User.findById(req.userId);
    if (!walletId) {
      const error = new Error('Could not find wallet or user.');
      error.statusCode = 404;
      throw error;
    }
    await user.removeFromFavourites(wallet);
    res.status(201).json({
      message: 'Wallet removed from favourites succesfully!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteWallet = async (req, res, next) => {
  const { walletId } = req.params;
  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      const error = new Error('Could not find wallet.');
      error.statusCode = 404;
      throw error;
    }
    if (wallet.creator.toString() !== req.userId) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }
    await Wallet.findByIdAndRemove(walletId);
    const user = await User.findById(req.userId);
    await user.removeFromWallets(walletId);
    res.status(200).json({
      message: 'Wallet was succesfull deleted.',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getFavouritesWallets = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    await user.populate('favouritesWallets.walletId').execPopulate();
    res.status(201).json({
      message: 'Favourites wallets fetched succesfully!',
      wallets: user.favouritesWallets,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addNewIncome = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.msg = errors.msg;
    throw error;
  }
  const { walletId } = req.body;
  const { category } = req.body;
  const { date } = req.body;
  const { info } = req.body;
  const { value } = req.body;

  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      const error = new Error('Could not find wallet.');
      error.statusCode = 404;
      throw error;
    }
    if (wallet.creator.toString() !== req.userId) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }
    const result = await wallet.addNewIncome(category, date, info, value);
    const addedIncomedata = result.incomes[result.incomes.length - 1];
    res.status(201).json({
      message: 'Income added succesfully!',
      category: addedIncomedata.category,
      date: addedIncomedata.date,
      info: addedIncomedata.info,
      value: addedIncomedata.value,
      operationId: addedIncomedata._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addNewExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.msg = errors.msg;
    throw error;
  }
  const { walletId } = req.body;
  const { category } = req.body;
  const { date } = req.body;
  const { info } = req.body;
  const { value } = req.body;

  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      const error = new Error('Could not find wallet.');
      error.statusCode = 404;
      throw error;
    }
    if (wallet.creator.toString() !== req.userId) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }
    const result = await wallet.addNewExpense(category, date, info, value);
    const addedExpensedata = result.expenses[result.expenses.length - 1];
    res.status(201).json({
      message: 'Income added succesfully!',
      category: addedExpensedata.category,
      date: addedExpensedata.date,
      info: addedExpensedata.info,
      value: addedExpensedata.value,
      operationId: addedExpensedata._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
