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

const Location = mongoose.model("Locations", LocationSchema);
module.exports = Location;