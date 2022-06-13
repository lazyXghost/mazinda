const storeTable = require("../models/store");
const locationTable = require("../models/location");
const categoryTable = require("../models/category");
const productTable = require("../models/product");
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
      image,
      categoryName,
    } = formData;

    const repeated = await productTable.find({
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
      salePrice: mrp,
      availableQuantity: availableQuantity,
      description: description,
      image: image,
    });
    return "Product Added Successfully";
  },

  changePassword: async function (req, res) {
    const { password, newPassword,confirmPassword } = req.body;
    if (newPassword == confirmPassword) {
      const store = await storeTable.findOne({ _id: req.user._id });
      const newEncryptedPassword = await bcrypt.hash(newPassword, 10);
      if (newPassword.length < 8) return "password is too Short.";
      if(bcrypt.compare(password,store.password)) {
        await store.updateOne({ password: newEncryptedPassword });
        return "Password changed Successfully.";
      } else return "invalid password";
    } else return "passwords do not match";
  },

  deleteProduct: async function (req, res) {
    const product_id = url.parse(req.url, true).query.ID;
    const product = await productTable.findOne({
      _id: product_id,
    });
    const element = await categoryTable.findOne({_id:product.category_id});
    await element.update({quantity:element.quantity-1});
    await product.delete();
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
};
