const storeTable = require("../models/store");
const categoryTable = require("../models/category");
const productTable = require("../models/product");
const moneyDetailTable = require("../models/moneyDetail");
const paymentTable = require("../models/payment");
const bcrypt = require("bcryptjs");
const url = require("url");
const { getLocations } = require("./utils");

module.exports = {
  addProduct: async function (formData, status) {
    const {
      name,
      store_id,
      category_id,
      costPrice,
      mrp,
      availableQuantity,
      description,
      images,
      categoryName,
    } = formData;

    const repeated = await productTable.findOne({
      name: name,
      store_id: store_id,
    });
    if (repeated) return "product already added";
    await productTable.create({
      name: name,
      store_id: store_id,
      category_id: category_id,
      costPrice: costPrice,
      mrp: mrp,
      salePrice: -1,
      availableQuantity: availableQuantity,
      description: description,
      images: images,
    });
    return "Product Added Successfully";
  },

  changePassword: async function (req, res) {
    const { password, newPassword, confirmPassword } = req.body;
    if (newPassword == confirmPassword) {
      const store = await storeTable.findOne({ _id: req.user._id });
      const newEncryptedPassword = await bcrypt.hash(newPassword, 10);
      if (newPassword.length < 8) return "password is too Short.";
      const checker = await bcrypt.compare(password, store.password);
      if (checker) {
        await store.updateOne({ password: newEncryptedPassword });
        return "Password changed Successfully.";
      } else return "invalid password";
    } else return "passwords do not match";
  },

  getRevenue: async function (moneyDetails, salesTime, revenueTime, tableTime) {
    let sales = 0;
    let totalRevenue = 0;
    const tableDetails = [];
    const date = new Date(Date.now());
    for (let i = 0; i < moneyDetails.length; i++) {
      let order = moneyDetails[i];
      if (
        order.orderTime.getMonth() == date.getMonth() &&
        order.status == "accepted"
      ) {
        if (
          revenueTime == "Month" ||
          order.orderTime.getDate() == date.getDate()
        )
          totalRevenue += order.costPrice * order.quantity;
        if (salesTime == "Month" || order.orderTime.getDate() == date.getDate())
          sales += 1;
      }
      if (
        order.orderTime.getMonth() == date.getMonth() &&
        (tableTime == "Month" || order.orderTime.getDate() == date.getDate())
      ) {
        tableDetails.push(order);
      }
    }
    const context = {
      revenue: totalRevenue,
      sales: sales,
      tableDetails: tableDetails,
    };
    return context;
  },

  deleteProduct: async function (req, res) {
    const product_id = url.parse(req.url, true).query.ID;
    const product = await productTable.findOne({
      _id: product_id,
    });
    const element = await categoryTable.findOne({ _id: product.category_id });
    await element.update({ quantity: element.quantity - 1 });
    await product.delete();
    return "product deleted Successfully.";
  },

  updateQuantity: async function (req, res) {
    const product_id = url.parse(req.url, true).query.product_id;
    const availableQuantity = url.parse(req.url, true).query.newQuantity;
    if (availableQuantity < 0) return "Quantity must be greater than zero";
    await productTable.findOneAndUpdate(
      { _id: product_id },
      { availableQuantity: availableQuantity }
    );
    return "Quantity Updated Successfully";
  },

  getPaymentDetails: async function (payments) {
    let amount = 0;
    for (let i = 0; i < payments.length; i++) {
      amount += payments[i].costPrice * payments[i].quantity;
    }
    return amount;
  },
  getMoneyPageData: async function (currentStore) {
    const pendingMoneyDetails = await moneyDetailTable.find({
      status: "pending",
      store_id: currentStore,
    });
    const payments = await paymentTable.find({ store_id: currentStore });
    const paymentDetails = [];
    for (let i = 0; i < payments.length; i++) {
      const moneyDetails_id = Array(payments[i].moneyDetails.length);
      for (let j = 0; j < payments[i].moneyDetails.length; j++) {
        moneyDetails_id[j] = payments[i].moneyDetails[j].moneyDetail_id;
      }
      const moneyDetailsData = await moneyDetailTable.find({
        _id: { $in: [...moneyDetails_id] },
      });
      console.log(moneyDetails_id);
      paymentDetails.push(moneyDetailsData);
    }
    const unPaidAmount = await module.exports.getPaymentDetails(
      pendingMoneyDetails
    );
    const locations = await getLocations();
    const context = {
      pendingMoneyDetails: pendingMoneyDetails,
      pendingMoneyDetailsJSON: JSON.stringify(pendingMoneyDetails),
      unPaidAmount: unPaidAmount,
      payments: payments,
      paymentDetails: JSON.stringify(paymentDetails),
      paymentsJSON: JSON.stringify(payments),
      currentStore: currentStore,
      cities: locations.cities,
    };
    return context;
  },
};
