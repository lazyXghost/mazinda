const storeTable = require("./models/store");
const locationTable = require("./models/location");
const categoriesTable = require("./models/category");
const productTable = require("./models/product");
const orderTable = require("./models/order");
const userTable = require("./models/user");
const addressTable = require("./models/address");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");
const passport = require("passport");
const url = require("url");
// const passport = require("./config/passport");

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

  // admin controls this functionality.
  storeRegister: async function (req) {
    console.log(req.body);
    const {
      storeName,
      email,
      password,
      sellerName,
      phoneNumber,
      whatsappNumber,
      building,
      street,
      locality,
      pincode,
      city,
      state,
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
    console.log(store._id);
    console.log("store created successfully");
    const address = await addressTable.create({
      user_id: store._id,
      pincode: pincode,
      state: state,
      city: city,
      building: building,
      street: street,
      locality: locality,
    });
    console.log("address added successfully");
    return "Store created successfully";
  },

  userRegister: async function () {
    const { phoneNumber, name, email, password } = req.body;
    if (password.length < 8) {
      console.log("password is too short");
      return "Password is too Short";
    }
    const oldUser = await userTable.findOne({ phoneNumber });

    if (oldUser) {
      console.log("user already exists");
      return "user already Exists";
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = userTable.create({
      name: name,
      email: email,
      password: encryptedPassword,
      phoneNumber: phoneNumber,
    });
  },

  addAddress: async function (req) {
    const { user_id } = req.user._id;
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
    console.log("address added successfully");
  },

  getCategories: async function (req, res) {
    const categories = await categoriesTable.find();
    const names = Array(categoriesTable.length);
    for (let i = 0; i < categories.length; i++) {
      names[i] = categories[i].categoryName;
    }
    res.render("admin/products", {
      user: req.user,
      authenticated: req.isAuthenticated(),
      names,
    });
  },

  // function on admin page to accept or reject stores.
  changeStatus: async function (req) {
    var params = url.parse(req.url, true).query;
    var store_id = params.ID;
    var status = params.task + "ed";
    await storeTable.findOneAndUpdate({ _id: store_id }, { status: status });
    return;
  },

  getProducts: async function (req, res) {
    const locations = await locationTable.find();
    const stores = await storeTable.find({ city: "IIT Mandi" });
    const categories = await categoriesTable.find();
    const store_id = Array(stores.length);
    for (let i = 0; i < stores.length; i++) {
      store_id[i] = stores[i]._id;
    }

    const products = await productTable.find({ store_id: { $in: store_id } });
    const categoryDict = {},
      storeDict = {};
    const cities = Array(locations.length);

    // console.log(locations.length);
    for (let i = 0; i < locations.length; i++) {
      cities[i] = locations[i].city;
    }
    for (let i = 0; i < categories.length; i++) {
      categoryDict[categories[i]._id] = categories[i].categoryName;
    }

    for (let i = 0; i < stores.length; i++) {
      storeDict[stores[i]._id] = stores[i].storeName;
    }

    const context = {
      products: products,
      storeDict: storeDict,
      categoryDict: categoryDict,
      cities: cities,
    };

    res.render("admin/products", {
      user: req.user,
      authenticated: req.isAuthenticated(),
      ...context,
    });
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
    } = formData;
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
    console.log("product added successfully.");
  },

  addCategory: async function (req, res) {
    const { categoryName } = req.body;
    const category = await categoriesTable.create({
      categoryName: categoryName,
    });
    e.preventdefault();
    alert("created a new store successfully");
    // console.log("created a new store");
    return;
  },

  // admin function

  getRevenue: async function (orders) {
    let totalRevenue = 0;
    for (var i = 0; i < orders.length; i++) {
      let order = orders[i];
      totalRevenue += order.amount;
    }
    return totalRevenue;
  },

  getHomePageData: async function () {
    const acceptedStores = await storeTable.countDocuments({
      status: "accepted",
    });
    const orders = await orderTable.countDocuments();
    const users = await userTable.countDocuments();
    const revenue = await module.exports.getRevenue(orders);
    const context = {
      orders: orders,
      acceptedStores: acceptedStores,
      users: users,
      revenue: revenue,
    };
    return context;
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

  getStorePageData: async function (currentCity,status) {
    const address = await addressTable.find({city:currentCity});
    const store_id = Array(address.length);
    
    for(let i=0;i<address.length;i++){
      store_id[i] = address.store_id;
    }
    const stores = await storeTable.find({
      status:status,
      store_id: {$in: store_id},
    });
    const pendingStores = await storeTable.find({
      status:"pending",
      store_id: {$in: store_id},
    })
    const locations = await module.exports.getLocations();
    const context = {
      cities: locations.cities,
      pending: pendingStores,
      stores: stores,
      status:status,
      currentCity:currentCity,
    };
    return context;
  },
// I have to get the city jedhe stores use kr reha mai.
  getProductPageData: async function (city) {
    const categories = await categoriesTable.find();
    const address = await addressTable.find({city:city});
    const store_id = Array(address.length);
    
    for(let i=0;i<address.length;i++){
      store_id[i] = address.store_id;
    }

    const stores = await storeTable.find({
      status:"accepted",
      store_id: {$in: store_id}
    });

    const acceptedStore_id = Array(stores.length);

    // const store_id2 = Array(stores.length);
    const locations = await module.exports.getLocations();
    const categoryDict = {},storeDict = {};

    for (let i = 0; i < categories.length; i++) {
      categoryDict[categories[i]._id] = categories[i].categoryName;
    }

    for (let i = 0; i < stores.length; i++) {
      storeDict[stores[i]._id] = stores[i].storeName;
    }

    for (let i = 0; i < stores.length; i++) {
      acceptedStore_id[i] = stores[i]._id;
    }

    // console.log(store_id);
    const pendingproducts = await productTable.find({
      status: "pending",
      store_id: { $in: acceptedStore_id },
    });
    const rejectedproducts = await productTable.find({
      status: "rejected",
      store_id: { $in: acceptedStore_id },
    });
    const acceptedproducts = await productTable.find({
      status: "accepted",
      store_id: { $in: acceptedStore_id },
    });
    // const products = await productTable.find({ store_id: { $in: store_id } });
    const context = {
      cities: locations.cities,
      categoryDict: categoryDict,
      storeDict: storeDict,
      pending: pendingproducts,
      rejected: rejectedproducts,
      accepted: acceptedproducts,
    };
    return context;
  },
};
