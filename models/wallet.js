const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema ({
    title: {
        type: String,
        require: true
    },
    startDate: {
        type: String,
        require: true 
    },
    endDate: {
        type: String,
        require: true 
    },
    isFavourite: {
        type: Boolean,
        default: false
    },
    incomes: [{
        category: {
            type: String,
            required: true
        },
        date: {
            type: String,
            require: true 
        },
        info: {
            type: String,
            required: false
        },
        value: {
            type: Number,
            required: true
        }
    }],
    expenses: [{
        category: {
            type: String,
            required: true
        },
        date: {
            type: String,
            require: true 
        },
        info: {
            type: String,
            required: false
        },
        value: {
            type: Number,
            required: true
        }
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
}, { timestamps: true })

walletSchema.methods.addToFavourites = function() {
    this.isFavourite = true;
    return this.save();
};

walletSchema.methods.removeFromFavourites = function() {
    this.isFavourite = false;
    return this.save();
};

walletSchema.methods.addNewIncome = function(category, date, info, value) {
    const newIncome = {
        category: category,
        date: date,
        info: info,
        value: value
    }
    const updatedWalletIncomes = [...this.incomes, newIncome];
    this.incomes = updatedWalletIncomes;
    return this.save();
};

walletSchema.methods.addNewExpense = function(category, date, info, value) {
    const newExpense = {
        category: category,
        date: date,
        info: info,
        value: value
    }
    const updatedWalletExpenses = [...this.expenses, newExpense];
    this.expenses = updatedWalletExpenses;
    return this.save();
};
module.exports = mongoose.model('Wallet', walletSchema);
