const storeTable = require("./models/store");
const locationTable = require("./models/location");
const categoryTable = require("./models/category");
const productTable = require("./models/product");
const userTable = require("./models/user");
const addressTable = require("./models/address");
const walletTable = require("./models/wallet");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");
const passport = require("passport");
const url = require("url");
var shortid = require("shortid");

module.exports = {

  localUserLogin: passport.authenticate("user-local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  localStoreLogin: passport.authenticate("store-local", {
    successRedirect: "/store",
    failureRedirect: "/store/login",
  }),
  localAdminLogin: passport.authenticate("admin-local", {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
  }),

  storeRegister: async function (req, res) {
    console.log(req.body);
    const {
      storeName,
      email,
      password,
      sellerName,
      phoneNumber,
      whatsappNumber,
    } = req.body;
    if (password.length < 8) {
      console.log("password is too short");
      return "Password is too Short";
    }
    const oldstore = await storeTable.findOne({ phoneNumber });

    if (oldstore) {
      console.log("store already exists");
      return "Store already Exists";
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const store = await storeTable.create({
      storeName: storeName,
      email: email.toLowerCase(),
      password: encryptedPassword,
      sellerName: sellerName,
      phoneNumber: phoneNumber,
      whatsappNumber: whatsappNumber,
    });
    const returnValue = await module.exports.addAddress(req, store._id);
    return `store and ${returnValue}`;
  },

  addAddress: async function (req, user_id) {
    const { building, street, locality, city, pincode, state } = req.body;
    const address = await addressTable.create({
      user_id: user_id,
      building: building,
      street: street,
      city: city,
      pincode: pincode,
      state: state,
      locality: locality,
    });
    const message = "address added successfully";
    console.log(message);
    return message;
  },

  getCategories: async function () {
    const categories = await categoryTable.find();
    return categories;
  },

  getLocations: async function () {
    const locations = await locationTable.find();
    let cities = Array(locations.length);
    let states = Array(locations.length);
    for (let i = 0; i < locations.length; i++) {
      cities[i] = locations[i].city;
      states[i] = locations[i].state;
    }
    const context = {
      cities: cities,
      states: states,
    };
    return context;
  },
};
