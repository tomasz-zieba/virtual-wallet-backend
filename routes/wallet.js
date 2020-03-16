const express = require('express');
const { body } = require('express-validator/check');

const isAuth = require('../middleware/is-auth');
const waletController = require('../controllers/wallet');
const router = express.Router();

router.put('/new-wallet', isAuth, waletController.newWallet);

module.exports = router;