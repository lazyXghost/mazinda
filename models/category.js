const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
});

const Category = mongoose.model("Categories", CategorySchema);
module.exports = Category; 
