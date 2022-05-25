const storeTable = require("./models/store");
const locationTable = require("./models/location");
const categoryTable = require("./models/category");
const productTable = require("./models/product");
const orderTable = require("./models/order");
const userTable = require("./models/user");
const moneyDetailTable = require("./models/moneyDetail");
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
  storeRegister: async function (req,res) {
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
    const categories = await categoryTable.find();
    const names = Array(categoryTable.length);
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
  storeStatusChange: async function (req) {
    const params = url.parse(req.url, true).query;
    const store_id = params.ID;
    const status = params.task;
    await storeTable.findOneAndUpdate({ _id: store_id }, { status: status });
    return;
  },

  moneyDetailStatusChange: async function(req) {
    const params = url.parse(req.url,true).query;
    const moneyDetail_id = params.ID;
    const status = params.task;
    await moneyDetailTable.findOneAndUpdate({_id:moneyDetail_id},{status:status});
    return;
  },

  productStatusChange: async function (req){
    const params = url.parse(req.url,true).query;
    const product_id = params.ID;
    const status = params.task;
    await productTable.findOneAndUpdate({_id:product_id},{status:status});
    return;
  },

  getProducts: async function (req, res) {
    const locations = await locationTable.find();
    const stores = await storeTable.find({ city: "IIT Mandi" });
    const categories = await categoryTable.find();
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

  // seller should be able to see the product quantity and price.
  updateQuantity: async function(req,res) {
    const product_id = url.parse(req.url, true).query.ID;
    const availableQuantity = req.body.availableQuantity;
    await productTable.findOneAndUpdate({ _id: product_id }, { availableQuantity: availableQuantity });
    return;
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
      categoryName
    } = formData;

    const repeated = await productTable.find({name:name,store_id:store_id});
    
    if(repeated) console.log("Product already added to the list");

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
    console.log("quantity updated and product added sucessfully");
  },


  getPaymentDetails: function(payments){
    let amount = 0
    for(let i=0;i<payments.length;i++){
      amount += (payments[i].costPrice * payments[i].quantity);
    }
    return amount;
  },
  // we need to create one more schema of the money page data.
  // refer to the below function when you are going to place the order.
  getMoneyPageData:async function (status) {
    const pendingMoneyDetails = moneyDetailTable.find({status:"pending"});
    const MoneyDetails = moneyDetailTable.find({status:status});
    const paidAmount = module.exports.getPaymentDetails(pendingMoneyDetails);
    const totalAmount = module.exports.getPaymentDetails(MoneyDetails) + paidAmount;
    const context = {
      MoneyDetails:MoneyDetails,
      pendingMoneyDetails:pendingMoneyDetails,
      paidAmount:paidAmount,
      totalAmount:totalAmount,
    }
    // const orders = await orderTable.find();
    // let products=[];
    // for(let i=0;i<orders.length;i++){
    //   const user = await userTable.find({_id:orders[i].user_id});
    //   for(let j=0;j<orders[i].products.length;j++){
    //     const product = await productTable.findOne({_id:orders[i].products[j].product_id});
    //     const store = await storeTable.findOne({_id:product.store_id});
    //     await moneyDetailTable.create( {
    //       productName:product.name,
    //       sellerName:store.sellerName,
    //       quantity:orders[i].products[j].quantity,
    //       costprice:product.costPrice,
    //       mrp:product.mrp,
    //       saleprice:product.salePrice,
    //       userName:user.name
    //     });
    //   }
    // }
    return context;
  },

  addCategory: async function (req, res) {
    const { categoryName } = req.body;
    const category = await categoryTable.create({
      categoryName: categoryName,
    });
    // console.log("added a new category");
    return;
  },

  deleteCategory: async function(req,res) {
    const category_id= req.body.category;
    await categoryTable.deleteOne({_id:category_id});
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
    const categories = await categoryTable.find();
    console.log(categories);
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
      currentCity:city,
    };
    return context;
  },
};
