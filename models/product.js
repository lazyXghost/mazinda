const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    shopID: {
        type: String,
        required: true,
    },
    categoryID:{
        type:String,
        required:true
    },
    trending: {
        type:Boolean,
        default:false
    },
    topDeal: {
        type:Boolean,
        default:false
    },
    costPrice: {
        type: Number,
        required: true,
    },
    mrp: {
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
    },
    approved: {
        type: Boolean,
        required: true,
        default:false,
    }
});

module.exports = mongoose.model("Products", ProductSchema);