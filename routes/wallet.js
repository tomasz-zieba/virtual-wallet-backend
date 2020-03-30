const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const waletController = require('../controllers/wallet');

const router = express.Router();

router.put('/new-wallet', [
  body('title')
    .not()
    .isEmpty()
    .withMessage("Wallet name can't be empty."),
], isAuth, waletController.newWallet);

router.get('/wallets', isAuth, waletController.getWallets);

router.get('/fav-wallets-add/:walletId', isAuth, waletController.addToFavourites);

router.get('/fav-wallets-remove/:walletId', isAuth, waletController.removeFromFavourites);

router.get('/favourites-wallets', isAuth, waletController.getFavouritesWallets);

router.get('/wallet/:walletId', isAuth, waletController.getWallet);

router.delete('/wallet/:walletId', isAuth, waletController.deleteWallet);

router.put('/wallet-income', [
  body('category')
    .isString()
    .not()
    .isEmpty(),
  body('date')
    .isString()
    .not()
    .isEmpty(),
  body('value')
    .isFloat()
    .not()
    .isEmpty(),
], isAuth, waletController.addNewIncome);

router.put('/wallet-expense', [
  body('category')
    .isString()
    .not()
    .isEmpty(),
  body('date')
    .isString()
    .not()
    .isEmpty(),
  body('value')
    .isFloat()
    .not()
    .isEmpty(),
], isAuth, waletController.addNewExpense);

module.exports = router;
