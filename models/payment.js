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
      },
    },
  ],
  paymentProof: {
    data: Buffer,
    contentType: String,
  },
  paymentTime: {
    type: Date,
    default: new Date(),
  },
  paymentNumber: {
    type: Number,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
