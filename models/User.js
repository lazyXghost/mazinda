const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");

const UserSchema = new mongoose.Schema({
    // googleId: {
    //     type: String,
    //     required: true,
    // },
    email: {
        type: String,
        required: true,
    },
    name: {
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
        }
    },
    city: {
        type:String,
        required:true
    }
});

module.exports = mongoose.model("UserDetails", UserSchema);
