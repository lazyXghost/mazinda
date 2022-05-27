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

    await storeTable.create({
      storeName: storeName,
      email: email.toLowerCase(),
      password: encryptedPassword,
      sellerName: sellerName,
      phoneNumber: phoneNumber,
      whatsappNumber: whatsappNumber,
    });
    const returnValue = module.exports.addAddress(req);
    return `store and ${returnValue}`;
  },

  userRegister: async function () {
    const { phoneNumber, name, email, password,referralCode } = req.body;
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

    if(referralCode) {
      const wallet = await walletTable.findOne({referralCode:referralCode});
      if(wallet){
        const currentDate = new Date();
        if((currentDate - wallet.createdOn)/86400000 <= 10){
          wallet.update({coins:wallet.coins+10});
        }
      } else {
        const message = "Invalid Referral Code";
        console.log(message);
        return message;
      }
    }

    const user = userTable.create({
      name: name,
      email: email,
      password: encryptedPassword,
      phoneNumber: phoneNumber,
    });

    await walletTable.create({
      user_id:user._id,
      createdOn:new Date(),
      coins:0,
      referralCode:shortid.generate(),
    });

   
    const message = "user Created Successfully"; 
    console.log(message);
    return message;
  },

  addAddress: async function (req) {
    const { user_id } = req.user._id;
    const { building, street, locality, city, pincode, state } = req.body;
    await addressTable.create({
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
