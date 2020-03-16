const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    password: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    wallets: [{
        type: Schema.Types.ObjectId,
        ref: 'Wallets'
    }],
    operationsCategories: {
        type: Object,
        default: {
            incomCategories: ['rachunki, zakupy, auto'],
            expenseCategories: ['rachunki, zakupy, auto']
        }
    }
})

module.exports = mongoose.model('User', userSchema);