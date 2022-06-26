const storeTable = require("../models/store");
const locationTable = require("../models/location");
const categoryTable = require("../models/category");
const productTable = require("../models/product");
const moneyDetailTable = require("../models/moneyDetail");
const userTable = require("../models/user");
const addressTable = require("../models/address");
const walletTable = require("../models/wallet");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");
const passport = require("passport");
const url = require("url");
var shortid = require("shortid");

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
    console.log("here");
    console.log(repeated);
    if (repeated) return "product already added";
    console.log("this also works");
    await productTable.create({
      name: name,
      store_id: store_id,
      category_id: category_id,
      costPrice: costPrice,
      mrp: mrp,
      salePrice: mrp,
      availableQuantity: availableQuantity,
      description: description,
      images: images,
    });
    console.log("now here");
    return "Product Added Successfully";
  },

  changePassword: async function (req, res) {
    const { password, newPassword,confirmPassword } = req.body;
    if (newPassword == confirmPassword) {
      const store = await storeTable.findOne({ _id: req.user._id });
      const newEncryptedPassword = await bcrypt.hash(newPassword, 10);
      if (newPassword.length < 8) return "password is too Short.";
      const checker = await bcrypt.compare(password,store.password);
      if(checker) {
        await store.updateOne({ password: newEncryptedPassword });
        return "Password changed Successfully.";
      } else return "invalid password";
    } else return "passwords do not match";
  },

  getRevenue: async function (moneyDetails,salesTime,revenueTime) {
    let sales = 0;
    let totalRevenue = 0;
    const tableDetails =[]
    const date = Date.now();
    for (let i = 0; i < moneyDetails.length; i++) {
      let order = moneyDetails[i];
      if( order.orderTime.getMonth() == date.getMonth() && order.status=="accepted"){
        if(revenueTime=="Month" || order.orderTime.getDate() == date.getDate())
          totalRevenue += order.costPrice * order.quantity;
        if(salesTime=="Month" || order.orderTime.getDate() == date.getDate())
          sales +=1;
      }
      if(order.orderTime.getMonth() == date.getMonth() && (tableTime=="Month" || order.orderTime.getDate() == date.getDate())){
        tableDetails.push(order);
      }
    }
    const context = {
      revenue:totalRevenue,
      sales:sales,
      tableDetails:tableDetails,
    };
    return context;
  },


  deleteProduct: async function (req, res) {
    const product_id = url.parse(req.url, true).query.ID;
    const product = await productTable.findOne({
      _id: product_id,
    });
    console.log("this work has been done");
    console.log(product.category_id);
    const element = await categoryTable.findOne({_id:product.category_id});
    console.log("this work has also been done");
    console.log(element);
    await element.update({quantity:element.quantity-1});
    await product.delete();
    console.log("this work is left yet");
    return "product deleted Successfully.";
  },

  updateQuantity: async function (req, res) {
    const product_id = url.parse(req.url, true).query.ID;
    const availableQuantity = req.body.availableQuantity;
    await productTable.findOneAndUpdate(
      { _id: product_id },
      { availableQuantity: availableQuantity }
    );
    return "Quantity Updated Successfully";
  },

  getPaymentDetails:async function(payments) {
    let amount = 0;
    for (let i = 0; i < payments.length; i++) {
      amount += (payments[i].status=='accepted')? payments[i].costPrice * payments[i].quantity:0;
    }
    return amount;
  },
  getMoneyPageData: async function(req) {
    const store = await storeTable.findOne({_id:req.user._id});
    const pendingMoneyDetails = await moneyDetailTable.find({status:"pending",store_id:store._id});
    const unPaidAmount = module.exports.getPaymentDetails(pendingMoneyDetails);
    const moneyDetails = await moneyDetailTable.find({status:{$ne:"pending"},store_id:store._id});
    const totalAmount = module.exports.getPaymentDetails(moneyDetails) + unPaidAmount;
    const context = {
      MoneyDetails:moneyDetails,
      pendingMoneyDetails:pendingMoneyDetails,
      unPaidAmount:unPaidAmount,
      totalAmount:totalAmount,
    };
    return context;
  },
};
