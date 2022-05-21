const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema({
    storeName: {
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
        store:{
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
    userType:{
        type:String,
        required:true,
        default:'store',
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
    }
});

module.exports = mongoose.model("Stores", StoreSchema);