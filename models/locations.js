const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
    city: {
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

module.exports = mongoose.model("Locations", LocationSchema);