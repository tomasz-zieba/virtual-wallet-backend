const User = require('../models/user');
const Wallet = require('../models/wallet');

const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

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
        .then( result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.wallets.push(wallet);
            return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'Wallet created succesfully!',
                wallet: wallet,
                creator: {_id: creator._id, name: creator.name}
            });
        })
        .catch(err => console.log(err));
};