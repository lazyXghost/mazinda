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
    const { phoneNumber, name, email, password, referralCode } = req.body;
    if (phoneNumber.length < 10) {
      const message = "Invalid phone Number";
      return message;
    }
    if (name.length == 0) {
      const message = "User name cannot be empty";
      return message;
    }
    if (email.includes("@") == false) {
      const message = "Invalid email";
      return message;
    }
    if (password.length < 8) {
      const message = "Password is too Short";
      return message;
    }
    const oldUser = await userTable.findOne({ phoneNumber });

    if (oldUser) {
      const message = "user already Exists";
      return message;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    if (referralCode) {
      const wallet = await walletTable.findOne({ referralCode: referralCode });
      if (wallet) {
        const currentDate = new Date();
        if ((currentDate - wallet.createdOn) / 86400000 <= 10) {
          wallet.update({ coins: wallet.coins + 10 });
        }
      } else {
        const message = "Invalid Referral Code";
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
    return message;
  },

  getIndexPageData: async function (currentCity) {
    const address = await addressTable.find({ city: currentCity });
    const store_id = Array(address.length);
    for (let i = 0; i < address.length; i++) store_id[i] = address[i].user_id;
    const products = await productTable.find({
      status: "accepted",
      store_id: { $in: [...store_id] },
    });
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
    const { cities } = await getLocations();
    const context = {
      topDeals: topDeals,
      trendings: trendings,
      categories: categories,
      offers: offers,
      cartItems: cart?.products?.length ?? 0,
      cities: cities,
      city: currentCity,
    };
    return context;
  },

  getProductPageData: async function (req, res) {
    const { search } = req.body;
    const category_id = url.parse(req.url, true).query.ID;
    const currentCity = url.parse(req.url, true).query.city || "Mandi";
    const address = await addressTable.find({ city: currentCity });
    const store_id = Array(address.length);
    for (let i = 0; i < address.length; i++) store_id[i] = address[i].user_id;
    const categories = await categoryTable.find();
    const cart = req.user
      ? await cartTable.findOne({ user_id: req.user._id })
      : null;
    const products = category_id
      ? await productTable.find({
          category_id: category_id,
          status: "accepted",
          store_id: { $in: [...store_id] },
        })
      : await productTable.find({ status: "accepted", store_id: { $in: [...store_id] } });

    const { cities } = await getLocations();
    const context = {
      products: products,
      categories: categories,
      cartItems: cart?.products?.length ?? 0,
      search: search,
      cities: cities,
      city: currentCity,
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
    let amount = 0,
      gross = 0;
    for (let i = 0; i < products.length; i++) {
      amount += products[i].availableQuantity * products[i].salePrice;
      gross += products[i].availableQuantity * products[i].mrp;
    }
    return [amount, gross - amount];
  },

  updateCartQuantity: async function (req, res) {
    const product_id = url.parse(req.url, true).query.product_id;
    const user_id = url.parse(req.url, true).query.user_id;
    const quantity = url.parse(req.url, true).query.newQuantity;
    if (quantity < 1) return "Quantity cannot be less than 1";
    const cart = await cartTable.findOne({ user_id: user_id });
    for (let i = 0; i < cart?.products?.length; i++) {
      if (product_id == cart.products[i].product_id) {
        cart.products[i].quantity = quantity;
        cart.save();
      }
    }
    return "Quantity Updated Successfully";
  },

  removeProduct: async function (req, res) {
    const product_id = url.parse(req.url, true).query.product_id;
    const user_id = url.parse(req.url, true).query.user_id;
    const cart = await cartTable.findOne({ user_id: user_id });
    for (let i = 0; i < cart.products.length; i++) {
      if (product_id == cart.products[i].product_id) {
        cart.products.splice(i, 1);
        cart.save();
      }
    }
    return "product Removed Successfully";
  },

  getCartPageData: async function (req, res) {
    const addresses = await addressTable.find({ user_id: req.user._id });
    const cart = await cartTable.findOne({ user_id: req.user._id });
    const wallet = await walletTable.findOne({ user_id: req.user._id });
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
      wallet: wallet,
    };
    return context;
  },

  getProfilePageData: async function (req, res) {
    const wallet = await walletTable.findOne({ user_id: req.user._id });
    const addresses = await addressTable.find({ user_id: req.user._id });
    const context = {
      wallet: wallet,
      addresses: addresses,
    };
    return context;
  },

  changePassword: async function (req, res) {
    const { password, newPassword, confirmPassword } = req.body;
    if (newPassword == confirmPassword) {
      const user = await userTable.findOne({ _id: req.user._id });
      const newEncryptedPassword = await bcrypt.hash(newPassword, 10);
      if (newPassword.length < 8) return "password is too Short.";
      const checker = await bcrypt.compare(password, store.password);
      if (checker) {
        await user.updateOne({ password: newEncryptedPassword });
        return "Password changed Successfully.";
      } else return "invalid password";
    } else return "passwords do not match";
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
          }
        });
    })();
  },

  placeOrder: async function (req, res) {
    const { orderType, address_id, amount, wallet } = req.body;

    const user_id = req.user._id;
    const user = await userTable.findOne({ _id: user_id });
    let products;
    const orderNumber = await module.exports.getOrderNumber(); // TODO:generate a random number.
    const cart = await cartTable.findOne({ user_id: user_id });
    if (orderType == "cart") {
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
    let orderDetails = {
      user_id: user_id,
      orderTime: Date.now(),
      orderNumber: orderNumber,
      products: products,
      orderNumber: orderNumber,
      address_id: address_id,
      amount: amount,
    };
    const order = await orderTable.create(orderDetails);
    const productDetails = [];

    for (let i = 0; i < order.products.length; i++) {
      const product = await productTable.findOne({
        _id: order.products[i].product_id,
      });
      productDetails.push(product);
      const store = await storeTable.findOne({ _id: product.store_id });
      await moneyDetailTable.create({
        productName: product.name,
        category: product.category_id,
        store_id: store._id,
        quantity: order.products[i].quantity,
        costPrice: product.costPrice,
        mrp: product.mrp,
        salePrice: product.salePrice,
        userName: user.name,
      });
    }

    // const pdfTemplate = await ejs.renderFile(
    //   "../static/user_UI/pdfInvoice.ejs",
    //   {
    //     orderNumber: orderNumber,
    //     orderTime: new Date().toLocaleDateString(),
    //     productDetails: productDetails,
    //     products: products,
    //     amount: amount,
    //     userName: user.name,
    //     phoneNumber: user.phoneNumber,
    //   },
    //   {
    //     beautify: true,
    //     async: true,
    //   }
    // );

    // htmlPdf
    //   .create(pdfTemplate, {
    //     format: "A4",
    //     httpHeaders: { "content-type": "application/pdf" },
    //     quality: "100",
    //     orientation: "portrait",
    //     type: "pdf",
    //   })
    //   .toFile(`../static/user_UI/orderBills/${orderNumber}`, (err, res) => {
    //     if (!err) {
    //     }
    //   });

    if (orderType == "cart") {
      cart.products = [];
      cart.category = "";
      cart.save();
    }
    return "order has been placed successfully";
  },
};
