const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    // googleId: {
    //     type: String,
    //     required: true,
    // },
    orderID: {
        type:String,
        required: true,
    },
    customerName: {
        type:String,
        required: true,
    },
    customersPhone: {
        type:String,
        required: true,
    },
    // shopName: {
    //     type:String,
    //     required: true,
    // },
    // sellerPhone: {
    //     type:Number,
    //     required: true,
    // },
    orderTime: {
        type:Date,
        default:Date.now(),
    },
    productsID: {
        type:Array,
        required:true,
    }
    // every quantity has a name , quantity and price associated with it.
});

module.exports = mongoose.model("OrderDetails", OrderSchema);