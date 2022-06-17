const storeTable = require("../models/store");
const locationTable = require("../models/location");
const categoryTable = require("../models/category");
const productTable = require("../models/product");
const cartTable = require("../models/cart");
const orderTable = require("../models/order");
const moneyDetailTable = require("../models/moneyDetail");
const userTable = require("../models/user");
const addressTable = require("../models/address");
const walletTable = require("../models/wallet");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");
const passport = require("passport");
const url = require("url");
var shortid = require("shortid");
const { getLocations, getCategories, addAddress } = require("../utils");

module.exports = {
  userRegister: async function (req) {
    console.log(req.body);
    const { phoneNumber, name, email, password, referralCode } = req.body;
    if (password.length < 8) {
      const message = "Password is too Short";
      console.log(message);
      return message;
    }
    const oldUser = await userTable.findOne({ phoneNumber });

    if (oldUser) {
      const message = "user already Exists";
      console.log(message);
      return message;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    if (referralCode) {
      console.log("this is ", referralCode);
      const wallet = await walletTable.findOne({ referralCode: referralCode });
      if (wallet) {
        const currentDate = new Date();
        if ((currentDate - wallet.createdOn) / 86400000 <= 10) {
          wallet.update({ coins: wallet.coins + 10 });
        }
      } else {
        const message = "Invalid Referral Code";
        console.log(message);
        return message;
      }
    }

    const user = await userTable.create({
      name: name,
      email: email,
      password: encryptedPassword,
      phoneNumber: phoneNumber,
    });

    await walletTable.create({
      user_id: user._id,
      createdOn: new Date(),
      coins: 0,
      referralCode: shortid.generate(),
    });

    const message = "user Created Successfully";
    console.log(message);
    return message;
  },

  getIndexPageData: async function (req, res) {
    const products = await productTable.find({ status: "accepted" });
    const categories = await categoryTable.find();
    const cart = req.user
      ? await cartTable.find({ user_id: req.user._id })
      : null;
    const trendings = [],
      topDeals = [];

    for (let i = 0; i < products.length; i++) {
      if (products[i].trending == true) trendings.push_back(products[i]);
      if (products[i].topDeal == true) topDeals.push_bacK(products[i]);
    }
    console.log(trendings.length);

    const context = {
      topDeals: topDeals,
      trendings: trendings,
      categories: categories,
      cartItems: cart?.products?.length ?? 0,
    };
    return context;
  },

  getProductPageData: async function (req, res) {
    const category_id = url.parse(req.url, true).query.ID;
    const categories = await categoryTable.find();
    const cart = req.user
      ? await cartTable.find({ user_id: req.user._id })
      : null;
    const products = category_id
      ? await productTable.find({ category_id: category_id })
      : await productTable.find();

    const context = {
      products: products,
      categories: categories,
      cartItems: cart?.products.length ?? 0,
    };
    return context;
  },

  getOrderPageData: async function (req, res) {
    const pendingOrders = await orderTable.find({
      user_id: req.user._id,
      status: "pending",
    });
    const completedOrders = await orderTable.find({
      user_id: req.user._id,
      status: { $ne: "pending" },
    });
    const pendingAddresses = Array(pendingOrders.length),
      completedAddresses = Array(completedOrders.length);
    const pendingProducts = Array(pendingOrders.length),
      completedProducts = Array(completedOrders.length);

    for (let i = 0; i < pendingOrders.length; i++) {
      const products = Array(pendingOrders[i].products.length);
      for (let j = 0; j < pendingOrders[i].products.length; j++) {
        const product = await productTable.findOne({
          _id: pendingOrders[i].products[j].product_id,
        });
        product.quantity = pendingOrders[i].products[j].quantity;
        products[j] = product;
      }
      pendingAddresses[i] = await addressTable.findOne({
        _id: pendingOrders[i].address_id,
      });
      pendingProducts[i] = products;
    }

    for (let i = 0; i < completedOrders.length; i++) {
      const products = Array(pendingOrders[i].products.length);
      for (let j = 0; j < completedOrders[i].products.length; j++) {
        const product = await productTable.findOne({
          _id: completedOrders[i].products[j].product_id,
        });
        product.quantity = pendingOrders[i].products[j].quantity;
        products[j] = product;
      }
      completedAddresses[i] = await addressTable.findOne({
        _id: completedOrders[i].address_id,
      });
      completedProducts[i] = products;
    }

    const context = {
      pendingOrders: pendingOrders,
      completedOrders: completedOrders,
      completedProducts: completedProducts,
      pendingProducts: pendingProducts,
      pendingAddresses: pendingAddresses,
      completedAddresses: completedAddresses,
    };
    return context;
  },

  getCartValue: async function (products) {
    let amount = 0,gross=0;
    for (let i = 0; i < products.length; i++) {
      amount += products[i].quantity * products[i].salePrice;
      gross += products[i].quantity * products[i].mrp;
    }
    return [amount,gross-amount];
  },

  getCartPageData: async function (req, res) {
    const addresses = await addressTable.find({user_id:req.user._id});
    const cart = await cartTable.find({ user_id: req.user._id });
    const length = cart?.products?.length ?? 0;
    const products = Array(length);
    for (let i = 0; i < length; i++) {
      const product = await productTable.findOne({
        _id: cart.products[i].product_id,
      });
      products[i] = product;
      products[i].quantity = cart.products[i].quantity;
    }
    const [amount,discount] = await module.exports.getCartValue(products);
    const context = {
      products: products,
      amount: amount,
      discount:discount,
      length:length,
      addresses:addresses,
    };
    return context;
  },

  getProfilePageData: async function (req, res) {
    const wallet = await walletTable.findOne({ user_id: req.user._id });
    const context = {
      wallet: wallet,
    };
    return context;
  },

  placeOrder: async function (req, res) {
    const { orderType, address_id, amount } = req.body;
    const user_id = req.user._id;
    let products;
    const orderNUmber = 123; // TODO:generate a random number.
    if (orderType == "cart") {
      const cart = await cartTable.findOne({ user_id: user_id });
      products = cart.products;
    } else {
      const { product_id, quantity } = req.body;
      products = [
        {
          product_id: product_id,
          quantity: quantity,
        },
      ];
    }
    const order = await orderTable.create({
      user_id: user_id,
      orderTime: Date.now(),
      products: products,
      orderNUmber: orderNUmber,
      address_id: address_id,
      amount: amount,
    });

    for (let i = 0; i < order.products.length; i++) {
      const product = await productTable.findOne({
        _id: order.products[i].product_id,
      });
      const store = await storeTable.findOne({ _id: product.store_id });
      await moneyDetailTable.create({
        productName: product.name,
        sellerName: store.sellerName,
        quantity: order.products[i].quantity,
        costprice: product.costPrice,
        mrp: product.mrp,
        saleprice: product.salePrice,
        userName: user.name,
      });
    }

    if (orderType == "cart") {
      cart.products = [];
      cart.save();
    }
    return "order has been placed successfully";
  },
};
