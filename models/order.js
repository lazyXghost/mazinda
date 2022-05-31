const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user_id:{
        type: String,
        required: true,
    },
    orderTime: {
        type:Date,
        default:Date.now(),
    },
    products: [
        {
            product_id: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
            }
        },
    ],
    orderNumber: {
        type: Number,
        required: true,
    },
    address_id:{
        type:String,
        required:true
    },
    status: {
        type: String,
        default: "pending"
    },
    amount: {
        type:Number,
        required:true,
    }
    // every quantity has a name , quantity and price associated with it.
});

const Order = mongoose.model("Orders", OrderSchema);
module.exports = Order;