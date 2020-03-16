const User = require('../models/user');

const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty() ) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        throw error;
    }

    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then( hashedPw => {
            const user = new User({
                password: hashedPw,
                name: name
            })
            return user.save();
        })
        .then( result => {
            res.status(201).json({message: 'User created!', userId: result._id})
        })
        .catch(err => {
            if( !err.statusCode ) {
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.login = (req, res, next) => {
    const password = req.body.password;
    const name = req.body.name;
    let loadedUser;
    User.findOne({name: name})
        .then( user => {
            if(!user) {
                const error = new Error('A user with this email not found');
                error.statuCode = 401;
                throw error;
            };
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if(!isEqual) {
                const error = new Error('Wrong password');
                error.statuCode = 401;
                throw error;
            };
            const token = jwt.sign(
                {
                    name: loadedUser.name,
                    userId: loadedUser._id.toString()
                }, 
                'secret', 
                {expiresIn:'1h'}
            );
            res.status(200).json({token: token, userId: loadedUser._id.toString()})
        })
        .catch(err => {
            if( !err.statusCode ) {
                err.statusCode = 500;
            }
            next(err);
        })
}