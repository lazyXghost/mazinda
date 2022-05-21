const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    userName: {
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
        type:String,
        required:true,
    },
    status: {
        type:String,
        required:true,
        default:'admin',
    }
});

module.exports = mongoose.model("Admins", AdminSchema);
