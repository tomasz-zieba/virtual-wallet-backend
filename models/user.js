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
        type: Object,
        default: {
            incomCategories: ['rachunki, zakupy, auto'],
            expenseCategories: ['rachunki, zakupy, auto']
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

userSchema.methods.removeFromWallets = function(walletId) {
    const updatedWalets = this.wallets.filter(wallet => wallet.walletId.toString() !== walletId);
    this.wallets = updatedWalets;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);