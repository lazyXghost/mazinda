const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    // googleId: {
    //     type: String,
    //     required: true,
    // },
    name: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Categories", CategorySchema);