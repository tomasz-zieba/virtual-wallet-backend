const User = require('../models/user');
const Wallet = require('../models/wallet');

const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

exports.getWallets = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then(user => {
      user
        .populate('wallets.walletId')
        .execPopulate()
        .then(user => {
          res.status(201).json({
            message: 'Wallets fetched succesfully!',
            wallets: user.wallets,
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        })

    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.getWallet = (req, res, next) => {
  const walletId = req.params.walletId;
  Wallet.findById(walletId)
      .then( wallet => {
          if(!wallet ) {
              const error = new Error('Could not find wallet.');
              error.statusCode = 404;
              throw error
          }
          if (wallet.creator._id.toString() !== req.userId) {
            const error = new Error('This wallet do not belong to current user.');
            error.statusCode = 404;
            throw error
          }
          res.status(200).json({ message: 'Wallet fetched', wallet: wallet});
      })
      .catch( err => {
          if( !err.statusCode ) {
              err.statusCode = 500;
          }
          next(err);
      })
};

exports.newWallet = (req, res, next) => {
  const title = req.body.title;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  let creator = req.userId
  const wallet = new Wallet({
    title: title,
    startDate: startDate,
    endDate: endDate,
    incomes: [],
    expenses: [],
    creator: creator
  });
  wallet.save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      return user.addToWallets(wallet);
    })
    .then(result => {
      res.status(201).json({
        message: 'Wallet created succesfully!',
        wallet: wallet,
        creator: {
          _id: creator._id,
          name: creator.name
        }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.deleteWallet = (req, res, next) => {
  const walletId = req.params.walletId;
  Wallet.findById(walletId)
      .then( wallet => {
          if(!wallet) {
              const error = new Error('Could not find wallet.');
              error.statusCode = 404;
              throw error
          }
          if(wallet.creator.toString() !== req.userId) {
              const error = new Error('Not authorized.');
              error.statusCode = 403;
              throw error
          }
          return Wallet.findByIdAndRemove(walletId);
      })
      .then( result => {
          return User.findById(req.userId)
      })
      .then( user => {
          user.removeFromWallets(walletId);
      })
      .then(result => {
          res.status(200).json({
              message: 'Wallet was succesfull deleted.',
          });
      })
      .catch( err => {
          if( !err.statusCode ) {
              err.statusCode = 500;
          }
          next(err);
      })
}
