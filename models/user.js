const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    address: {
        house:{
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
        }
    },
    userType:{
        type:String,
        required:true,
        default:'user',
    }
});

module.exports = mongoose.model("Users", UserSchema);
