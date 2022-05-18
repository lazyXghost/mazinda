const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
    // googleId: {
    //     type: String,
    //     required: true,
    // },
    place: {
        type: String,
        required: true,
    },
    pincode: {
        type:Number,
        required:true,
    },
    state: {
        type:String,
        required:true,
    }
});

module.exports = mongoose.model("LocationDetails", LocationSchema);