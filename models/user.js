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
    wallets: [
        {
            walletId: {
                type: Schema.Types.ObjectId,
                ref: 'Wallet'
            }
        }
    ],
    favouritesWallets: [
        {
            walletId: {
                type: Schema.Types.ObjectId,
                ref: 'Wallet'
            }
        }
    ],
    operationsCategories: {
            income: {
                type: Array,
                required: true,
                default: ['rachunki', 'zakupy', 'auto']
            } ,
            expense: {
                type: Array,
                required: true,
                default: ['rachunki', 'zakupy', 'auto']
            }
    }
})

userSchema.methods.addToWallets = function(wallet) {
    const updatedWalets = [...this.wallets];
    updatedWalets.push({
        walletId: wallet._id,
      })
    this.wallets = updatedWalets;
    return this.save();
  };

userSchema.methods.removeFromWallets = function(walletId) {
    const updatedWalets = this.wallets.filter(wallet => wallet.walletId.toString() !== walletId);
    const updatedFavourites = this.favouritesWallets.filter(wallet => wallet.walletId.toString() != walletId);
    this.wallets = updatedWalets;
    this.favouritesWallets = updatedFavourites;
    return this.save();
};

userSchema.methods.addToFavourites = function(wallet) {
    const updatedFavourites = [...this.favouritesWallets];
    updatedFavourites.push({
        walletId: wallet._id,
        })
    this.favouritesWallets = updatedFavourites;
    return this.save();
};

userSchema.methods.removeFromFavourites = function(wallet) {
    let updatedFavourites = [...this.favouritesWallets];
    updatedFavourites = this.favouritesWallets.filter(item => {
        return wallet._id.toString() !== item.walletId.toString()
    });
    this.favouritesWallets = updatedFavourites;
    return this.save();
};

userSchema.methods.addCategory = function(categoryName, categoryType) {
    const updatedIncomCategories = [...this.operationsCategories[`${categoryType}`]]
    if(!updatedIncomCategories.includes(categoryName.trim())) {
        updatedIncomCategories.push(categoryName)
    } else {
        const error = new Error('Category already exist.');
        error.statusCode = 403;
        throw error
    }
    this.operationsCategories[`${categoryType}`] = updatedIncomCategories;
    return this.save();
};

userSchema.methods.removeCategory = function(categoryNamesList, categoryType) {
    const updatedIncomCategories = this.operationsCategories[`${categoryType}`].filter(item => !categoryNamesList.includes(item));
    this.operationsCategories[`${categoryType}`] = updatedIncomCategories;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);