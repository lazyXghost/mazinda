const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
    },
    products:[
        {
            product_id:{
                type:String,
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
            }
        }
    ],
});

const Cart = mongoose.model("Carts", CartSchema);
module.exports = Cart; 
