const shopTable = require("./models/shop");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
  login: async function (email, password, done) {
    const shop = await shopTable.findOne({ email });

    if (shop && (await bcrypt.compare(password, shop.password))) {
      return done(null, true);
    }
    return done(null, false);
  },

  register: async function (req, res) {
    const {
      shopName,
      email,
      password,
      sellerName,
      phoneNumber,
      whatsappNumber,
      pincode,
      city,
      state,
    } = req.body;
    if (password.length < 8) {
      return res.redirect("/store/register");
    }
    const oldShop = await shopTable.findOne({ phoneNumber });

    if (oldShop) {
      console.log("User already exists");
      return res.redirect("/store/login");
    }

    // const encryptedPassword = await bcrypt.hash(password, 10);

    // adding a new shop.
    const fulladdress = {
      pincode: pincode,
      state: state,
      city: city,
      shop: "gibberish",
      street: "gibberish",
      colony: "gibberish",
    };
    const shop = await shopTable.create({
      shopName: shopName,
      email: email.toLowerCase(),
      password: password,
      sellerName: sellerName,
      phoneNumber: phoneNumber,
      whatsappNumber: whatsappNumber,
      address: fulladdress,
    });
    console.log("created a new shop");
    res.render("store/login");
  },
};
