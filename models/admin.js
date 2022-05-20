const req = require("express/lib/request");
const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");

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

const Admin =  mongoose.model("Admins", AdminSchema);
module.exports = Admin;
