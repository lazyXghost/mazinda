const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    store_id: {
        type: String,
        required: true,
    },
    category_id:{
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
    availableQuantity: {
        type:Number,
        required:true,
    },
    description: {
        type:String,
        required: true,
    },
    status: {
        type: String,
        default:'pending',
    },
    image: {
        data: Buffer,
        contentType: String,
    }
});

const Product = mongoose.model("Products", ProductSchema);
module.exports = Product;
