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
    userType:{
        type:String,
        default:'store',
    },
    status: {
        type: String,
        default: 'pending',
    }
});

const Store = mongoose.model("Stores", StoreSchema);
module.exports = Store;