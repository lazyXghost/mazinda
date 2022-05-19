const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true,
    },
    email: {
        type:String,
        required: true,
    },
    password: {
        type:String,
        required: true,
    },
    sellerName:{
        type:String,
        required:true
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    whatsappNumber: {
        type:Number,
        required:true,
    },
    address: {
        shop:{
            type: String,
            required: true
        },
        street:{
            type: String,
            required: true
        },
        colony:{
            type: String,
            required: true
        },
        city: {
            type:String,
            required:true
        },
        pincode: {
            type:Number,
            required:true
        },
        state: {
            type:String,
            required:true
        },
    },
});

const Shop = mongoose.model("Shops", ShopSchema);
module.exports = Shop