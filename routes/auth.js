const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const authController = require('../controllers/auth');
const router = express.Router();

router.put('/signup', [
    body('password')
        .trim()
        .isLength({min: 5})
        .withMessage('Please enter a valid password.'),
    body('name')
        .trim()
        .custom((value, {req}) => {
            return User.findOne({name: value}).then(userDoc => {
                if(userDoc) {
                    return Promise.reject('User name already exist!')
                }
            })
        })
        .isLength({min: 5})
        .not()
        .isEmpty()
        .withMessage('Please enter a valid name.')
    ],
    authController.signup
);

router.post('/login', authController.login)

module.exports = router;