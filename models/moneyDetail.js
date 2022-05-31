const mongoose = require("mongoose");

const MoneyDetailSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    sellerName: {
        type:String,
        required:true,
    },
    quantity: {
        type:Number,
        default:0,
    },
    costPrice:{
        type:Number,
        required:true,
    },
    mrp:{
        type:Number,
        required:true,
    },
    salePrice:{
        type:String,
        required:true,
    },
    userName:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:"pending",
    }
});

const MoneyDetail = mongoose.model("MoneyDetails", MoneyDetailSchema);
module.exports = MoneyDetail; 
