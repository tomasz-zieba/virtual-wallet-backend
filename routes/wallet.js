const express = require('express');
const { body } = require('express-validator/check');

const isAuth = require('../middleware/is-auth');
const waletController = require('../controllers/wallet');
const router = express.Router();

router.put('/new-wallet', isAuth, waletController.newWallet);

router.get('/wallets', isAuth, waletController.getWallets);

router.get('/wallet/:walletId', isAuth, waletController.getWallet);

router.delete('/wallet/:walletId', isAuth , waletController.deleteWallet);

module.exports = router;