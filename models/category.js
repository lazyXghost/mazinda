const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    quantity: {
        type:Number,
        default:0,
    }
});

const Category = mongoose.model("Categories", CategorySchema);
module.exports = Category; 
