const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  whatsappNumber: {
    type: Number,
    required: true,
  },
  userType: {
    type: String,
    required: true,
    default: "store",
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  description: {
    type: String,
    required: false,
    default: "No description Provided",
  },
});

const Store = mongoose.model("Stores", StoreSchema);
module.exports = Store;
