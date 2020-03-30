const { validationResult } = require('express-validator');
const User = require('../models/user');
const Wallet = require('../models/wallet');


exports.getWallets = (req, res, next) => {
  const { userId } = req;
  User.findById(userId)
    .then((user) => user
      .populate('wallets.walletId')
      .execPopulate())
    .then((user) => {
      res.status(201).json({
        message: 'Wallets fetched succesfully!',
        wallets: user.wallets,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getWallet = (req, res, next) => {
  const { walletId } = req.params;
  Wallet.findById(walletId)
    .then((wallet) => {
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
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.newWallet = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.msg = errors.msg;
    throw error;
  }
  const { title } = req.body;
  const { startDate } = req.body;
  const { endDate } = req.body;
  let creator = req.userId;
  const wallet = new Wallet({
    title,
    startDate,
    endDate,
    incomes: [],
    expenses: [],
    creator,
  });
  wallet.save()
    .then(() => User.findById(req.userId))
    .then((user) => {
      creator = user;
      return user.addToWallets(wallet);
    })
    .then(() => {
      res.status(201).json({
        message: 'Wallet created successfully!',
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addToFavourites = (req, res, next) => {
  const { walletId } = req.params;
  let favWallet;
  Wallet.findById(walletId)
    .then((wallet) => {
      favWallet = wallet;
      favWallet.addToFavourites();
      return User.findById(req.userId);
    })
    .then((user) => {
      if (walletId) { return user.addToFavourites(favWallet); }

      const error = new Error('Could not find wallet or user.');
      error.statusCode = 404;
      throw error;
    })
    .then(() => {
      res.status(201).json({
        message: 'Wallet added to favourites succesfully!',
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


exports.removeFromFavourites = (req, res, next) => {
  const { walletId } = req.params;
  let favWallet;
  Wallet.findById(walletId)
    .then((wallet) => {
      favWallet = wallet;
      favWallet.removeFromFavourites();
      return User.findById(req.userId);
    })
    .then((user) => {
      if (walletId) { return user.removeFromFavourites(favWallet); }

      const error = new Error('Could not find wallet or user.');
      error.statusCode = 404;
      throw error;
    })
    .then(() => {
      res.status(201).json({
        message: 'Wallet removed from favourites succesfully!',
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


exports.deleteWallet = (req, res, next) => {
  const { walletId } = req.params;
  Wallet.findById(walletId)
    .then((wallet) => {
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
      return Wallet.findByIdAndRemove(walletId);
    })
    .then(() => User.findById(req.userId))
    .then((user) => {
      user.removeFromWallets(walletId);
    })
    .then(() => {
      res.status(200).json({
        message: 'Wallet was succesfull deleted.',
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getFavouritesWallets = (req, res, next) => {
  const { userId } = req;
  User.findById(userId)
    .then((user) => user
      .populate('favouritesWallets.walletId')
      .execPopulate())
    .then((user) => {
      res.status(201).json({
        message: 'Favourites wallets fetched succesfully!',
        wallets: user.favouritesWallets,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addNewIncome = (req, res, next) => {
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

  Wallet.findById(walletId)
    .then((wallet) => {
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
      return wallet.addNewIncome(category, date, info, value);
    })
    .then((result) => {
      const addedIncomedata = result.incomes[result.incomes.length - 1];
      res.status(201).json({
        message: 'Income added succesfully!',
        category: addedIncomedata.category,
        date: addedIncomedata.date,
        info: addedIncomedata.info,
        value: addedIncomedata.value,
        operationId: addedIncomedata._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addNewExpense = (req, res, next) => {
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

  Wallet.findById(walletId)
    .then((wallet) => {
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
      return wallet.addNewExpense(category, date, info, value);
    })
    .then((result) => {
      const addedExpensedata = result.expenses[result.expenses.length - 1];
      res.status(201).json({
        message: 'Income added succesfully!',
        category: addedExpensedata.category,
        date: addedExpensedata.date,
        info: addedExpensedata.info,
        value: addedExpensedata.value,
        operationId: addedExpensedata._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
