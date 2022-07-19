const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  building: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});

const Address = mongoose.model("Address", AddressSchema);
module.exports = Address;
