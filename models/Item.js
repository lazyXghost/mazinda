const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    // googleId: {
    //     type: String,
    //     required: true,
    // },
    name: {
        type: String,
        required: true,
    },
    category:{
        type:String,
        required:true
    },
    trending: {
        type:Boolean,
        default:false
    },
    topdeal: {
        type:Boolean,
        default:false
    },
    sellerID: {
        type: String,
        required: true,
    },
    costPrice: {
        type: Number,
        required: true,
    },
    MRP: {
        type:Number,
        required:true
    },
    salePrice: {
        type:Number
    },
    quantity: {
        type:Number,
        required:true,
    },
    description: {
        type:String,
        required: true,
    }
});

module.exports = mongoose.model("ItemDetails", ItemSchema);