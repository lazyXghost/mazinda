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
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const htmlPdf = require("html-pdf");
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

    const wallet = await walletTable.create({
      user_id: user._id,
      createdOn: new Date(),
      coins: 0,
      referralCode: shortid.generate(),
    });

    const cart = await cartTable.create({
      user_id: user._id,
      products: [],
    });

    const message = "user Created Successfully";
    console.log(message);
    return message;
  },

  getIndexPageData: async function (req, res) {
    const products = await productTable.find({ status: "accepted" });
    const categories = await categoryTable.find();
    const cart = req.user
      ? await cartTable.findOne({ user_id: req.user._id })
      : null;
    const trendings = [],
      topDeals = [];

    for (let i = 0; i < products.length; i++) {
      if (products[i].trending == true) trendings.push(products[i]);
      if (products[i].topDeal == true) topDeals.push(products[i]);
    }
    const offers = [];

    const context = {
      topDeals: topDeals,
      trendings: trendings,
      categories: categories,
      offers: offers,
      cartItems: cart?.products?.length ?? 0,
    };
    return context;
  },

  getProductPageData: async function (req, res) {
    const {search} = req.body;
    console.log(search);
    const category_id = url.parse(req.url, true).query.ID;
    const categories = await categoryTable.find();
    const cart = req.user
      ? await cartTable.findOne({ user_id: req.user._id })
      : null;
    const products = category_id
      ? await productTable.find({ category_id: category_id })
      : await productTable.find();

    
    const context = {
      products: products,
      categories: categories,
      cartItems: cart?.products?.length ?? 0,
      search:search
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
    console.log(products);
    let amount = 0,
      gross = 0;
    for (let i = 0; i < products.length; i++) {
      amount += products[i].availableQuantity * products[i].salePrice;
      gross += products[i].availableQuantity * products[i].mrp;
    }
    return [amount, gross - amount];
  },

  getCartPageData: async function (req, res) {
    const addresses = await addressTable.find({ user_id: req.user._id });
    const cart = await cartTable.findOne({ user_id: req.user._id });
    const length = cart?.products?.length ?? 0;
    const products = Array(length);
    for (let i = 0; i < length; i++) {
      const product = await productTable.findOne({
        _id: cart.products[i].product_id,
      });
      product.availableQuantity = cart.products[i].quantity;
      products[i] = product;
    }
    const [amount, discount] = await module.exports.getCartValue(products);
    const context = {
      products: products,
      amount: amount,
      discount: discount,
      length: length,
      addresses: addresses,
    };
    console.log(context);
    return context;
  },

  getProfilePageData: async function (req, res) {
    const wallet = await walletTable.findOne({ user_id: req.user._id });
    const context = {
      wallet: wallet,
    };
    return context;
  },
  getOrderNumber: async function () {
    const Day = new Date();
    let month, day, year;
    year = ((Day.getFullYear() + 5) % 100).toString();
    month =
      Day.getMonth() + 5 < 10
        ? "0" + (Day.getMonth() + 5).toString()
        : (Day.getMonth() + 5).toString();
    day =
      Day.getDate() + 5 < 10
        ? "0" + (Day.getDate() + 5).toString()
        : (Day.getDate() + 5).toString();
    let number = await orderTable.countDocuments();
    number += 1;
    number =
      number < 10
        ? "000" + number.toString()
        : number < 100
        ? "00" + number.toString()
        : number < 1000
        ? "0" + number.toString()
        : number.toString();
    console.log(year + month + day + number);
    return year + month + day + number;
  },

  generateBill: async function (req, res) {
    (async function () {
      const pdfTemplate = await ejs.renderFile(
        "../static/user_UI/pdfInvoice.ejs",
        {
          orderNumber: await getOrderNumber(),
          date: new Date().toLocaleDateString(),
          payments: [
            {
              description: "oke",
              durationPerHours: 20,
              rentPerHours: 10,
              amount: 2000,
            },
          ],
          grossAmount: "RM " + 5000,
          discount: "RM " + 1000,
          netAmount: 1,
          fullName: "john doe",
          phoneNumber: "+6287887242891",
        },
        {
          beautify: true,
          async: true,
        }
      );

      htmlPdf
        .create(pdfTemplate, {
          format: "A4",
          httpHeaders: { "content-type": "application/pdf" },
          quality: "100",
          orientation: "portrait",
          type: "pdf",
        })
        .toFile(path.join(__dirname, "index.pdf"), (err, res) => {
          if (!err) {
            console.log(res.filename);
          }
        });
    })();
  },

  placeOrder: async function (req, res) {
    const { orderType, address_id, amount } = req.body;
    const user_id = req.user._id;
    const user = await userTable.findOne({ _id: user_id });
    let products;
    const orderNumber = await module.exports.getOrderNumber(); // TODO:generate a random number.
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
      orderNumber: orderNumber,
      products: products,
      orderNumber: orderNumber,
      address_id: address_id,
      amount: amount,
    });
    const productDetails = [];

    for (let i = 0; i < order.products.length; i++) {
      const product = await productTable.findOne({
        _id: order.products[i].product_id,
      });
      productDetails.push(product);
      const store = await storeTable.findOne({ _id: product.store_id });
      await moneyDetailTable.create({
        productName: product.name,
        category: product.category,
        sellerName: store.sellerName,
        quantity: order.products[i].quantity,
        costprice: product.costPrice,
        mrp: product.mrp,
        saleprice: product.salePrice,
        userName: user.name,
      });
    }

    const pdfTemplate = await ejs.renderFile(
      "../static/user_UI/pdfInvoice.ejs",
      {
        orderNumber: orderNumber,
        orderTime: new Date().toLocaleDateString(),
        productDetails: productDetails,
        products: products,
        amount: amount,
        userName: user.name,
        phoneNumber: user.phoneNumber,
      },
      {
        beautify: true,
        async: true,
      }
    );

    htmlPdf
      .create(pdfTemplate, {
        format: "A4",
        httpHeaders: { "content-type": "application/pdf" },
        quality: "100",
        orientation: "portrait",
        type: "pdf",
      })
      .toFile(`../static/user_UI/orderBills/${orderNumber}`, (err, res) => {
        if (!err) {
          console.log(res.filename);
        }
      });

    if (orderType == "cart") {
      cart.products = [];
      cart.save();
    }
    return "order has been placed successfully";
  },
};
