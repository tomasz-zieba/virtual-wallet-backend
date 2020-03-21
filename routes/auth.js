const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const router = express.Router();

router.put('/signup', [
    body('password')
        .trim()
        .isLength({min: 5})
        .withMessage('Password must contain at least 5 characters.'),
    body('name')
        .trim()
        .custom((value, {req}) => {
            return User.findOne({name: value}).then(userDoc => {
                if(userDoc) {
                    return Promise.reject('User name already exist!')
                }
            })
        })
        .not()
        .isEmpty()
        .withMessage('Please enter a valid name.')
    ],
    authController.signup
);

router.post('/login', authController.login)

module.exports = router;