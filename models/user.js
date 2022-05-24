const mongoose = require("mongoose");

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
    password: {
        type: String,
        required: true
    },
    userType:{
        type:String,
        default:'user',
    }
});

const User =  mongoose.model("Users", UserSchema);
module.exports = User;