const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  store_id: {
    type: String,
    required: true,
  },
  moneyDetails: [
    {
      moneyDetail_id: {
        type: String,
        required: true,
      },
    },
  ],
  paymentProof: {
    type: Buffer,
    required: true,
  },
  paymentTime: {
    type: Date,
    required: true,
  },
  paymentNumber: {
    type: Number,
    required: true,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
