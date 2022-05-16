const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema({
    // googleId: {
    //     type: String,
    //     required: true,
    // },
    shopName: {
        type: String,
        required: true,
    },
    sellerID: {
        type:string,
        unique:true,
        required:true
    },
    sellerName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    email: {
        type:String,
        required:true
    },
    address: {
        House:{
        type: String,
        required: true
        },
        Street:{
        type: String,
        required: true
        },
        colony:{
        type: String,
        required: true
        }
    },
    city: {
        type:String,
        required:true
    }
});

module.exports = mongoose.model("UserDetails", UserSchema);