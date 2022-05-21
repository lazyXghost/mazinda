const shopTable = require("./models/shop");
const locationTable = require("./models/location");
const categoriesTable = require("./models/category");
const adminTable = require("./models/admin");
const productTable = require("./models/product");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");

module.exports = {
  shopLogin: async function (email, password, done) {
    const shop = await shopTable.findOne({ email });

    if (shop && (await bcrypt.compare(password, shop.password))) {
      return done(null, shop);
    }
    return done(null, false);
  },

  userLogin: async function(phoneNumber,password,done) {
    const user = await userTable.findOne({phoneNumber:phoneNumber});
    if(user && (await bcrypt.compare(password,user.compare))) {
      return done(null,user);
    }
    return done(null,false);
  },

  adminLogin: async function(username,password,done) {
    // later
    const admin = await adminTable.findOne({userName:username});
    if(admin && (await bcrypt.compare(password,admin.password))) {
      return done(null,admin);
    }
    return done(null,false);
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
      // console.log("User already exists");
      return res.redirect("/store/login");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

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
      password: encryptedPassword,
      sellerName: sellerName,
      phoneNumber: phoneNumber,
      whatsappNumber: whatsappNumber,
      address: fulladdress,
    });
    // console.log("created a new shop");
    res.render("store/login");
  },

  addstore:async function(req,res) {
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
      return res.redirect("/admin/addstore");
    }
    const oldShop = await shopTable.findOne({ phoneNumber });

    if (oldShop) {
      // console.log("User already exists");
      return res.redirect("/admin/addstore");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

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
      password: encryptedPassword,
      sellerName: sellerName,
      phoneNumber: phoneNumber,
      whatsappNumber: whatsappNumber,
      address: fulladdress,
    });
    e.preventdefault();
    alert("created a new shop successfully");
    // console.log("created a new shop");
    return;
  },

  getLocations: async function(req,res) {
    const locations = await locationTable.find();
    const cities = Array(locations.length),states = Array(locations.length); 
    // console.log(locations.length);
    for(let i=0;i < locations.length;i++){
      cities[i] = dbObjects[i].city;
      states[i] = dbObjects[i].state;
    }
    const context = {
      "cities":cities,
      "states":states,
    }
    // console.log(context);
    res.render("admin/addstore",{
      user: req.user,
      authenticated: req.isAuthenticated(),
      ...context,
    });
    return;
  },

  getCategories: async function(req,res) {
    const categories = await categoriesTable.find();
    const names= Array(categoriesTable.length);
    for(let i=0;i< categories.length;i++){
      names[i] = categories[i].categoryName;
    }
    res.render("admin/products",{
      user: req.user,
      authenticated: req.isAuthenticated(),
      names
    });
  },

  getProducts: async function (req,res) {
    const locations = await locationTable.find();
    const shops = await shopTable.find({city:"IIT Mandi"});
    const categories = await categoriesTable.find();
    const shopId = Array(shops.length);
    for(let i=0;i<shops.length;i++){
      shopId[i] = shops[i]._id;
    }

    const products = await productTable.find({shopID:{"$in":shopId}});
    const categoryDict = {},shopDict ={};
    const cities = Array(locations.length); 
    
    // console.log(locations.length);
    for(let i=0;i < locations.length;i++){
      cities[i] = locations[i].city;
    }
    for(let i=0;i<categories.length;i++){
      categoryDict[categories[i]._id] = categories[i].categoryName
    }

    for(let i=0;i < shops.length;i++){
      shopDict[shops[i]._id] = shops[i].shopName;
    }

    const context = {
      "products":products,
      "shopDict":shopDict,
      "categoryDict":categoryDict,
      "cities":cities
    };

    res.render("admin/products",{
      user: req.user,
      authenticated: req.isAuthenticated(),
      ...context,
    });
  },

  addProducts: async function(req,res){
    // do something here.
  },

  addCategory: async function(req,res) {
    const {categoryName} = req.body;
    const category = await categoriesTable.create({
      categoryName:categoryName,
    });
    e.preventdefault();
    alert("created a new shop successfully");
    // console.log("created a new shop");
    return;
  }


};
