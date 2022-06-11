const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required: true,
        unique:true
    },
    referralCode:{
        type:String,
        unique:true,
        required:true,
    },
    createdOn:{
        type:Date,
        required:true,
    },
    coins:{
        type:Number,
        default:0,
    },
});

const Wallet = mongoose.model("Wallets", WalletSchema);
module.exports = Wallet