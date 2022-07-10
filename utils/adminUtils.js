const storeTable = require("../models/store");
const categoryTable = require("../models/category");
const productTable = require("../models/product");
const orderTable = require("../models/order");
const userTable = require("../models/user");
const moneyDetailTable = require("../models/moneyDetail");
const addressTable = require("../models/address");
const url = require("url");
const fs = require("fs");
const { getLocations } = require("../utils");
const multer = require("multer");

module.exports = {
  getRevenue: async function (orders) {
    let totalRevenue = 0;
    for (var i = 0; i < orders.length; i++) {
      let order = orders[i];
      console.log(order);
      totalRevenue += order.amount;
    }
    return totalRevenue;
  },

  getPaymentDetails: function (payments) {
    if (payments.length && payments[0].status == "returned") return 0;
    let amount = 0;
    for (let i = 0; i < payments.length; i++) {
      amount += payments[i].costPrice * payments[i].quantity;
    }
    return amount;
  },

  storeStatusChange: async function (req) {
    const params = url.parse(req.url, true).query;
    const store_id = params.ID;
    const status = params.task;
    await storeTable.findOneAndUpdate({ _id: store_id }, { status: status });
    return;
  },

  moneyDetailStatusChange: async function (req) {
    const params = url.parse(req.url, true).query;
    const moneyDetail_id = params.ID;
    const status = params.task;
    await moneyDetailTable.findOneAndUpdate(
      { _id: moneyDetail_id },
      { status: status }
    );
    return;
  },

  productDetailsChange: async function (req) {
    const params = url.parse(req.url, true).query;
    const product_id = params.ID;
    const task = params.task;
    var updation = {};
    if (task == "status") {
      updation = { status: params.newValue };
    } else if (task == "topDeal") {
      updation = { topDeal: params.newValue };
    } else if (task == "trending") {
      updation = { trending: params.newValue };
    }

    await productTable.findOneAndUpdate({ _id: product_id }, updation);
    return;
  },

  addCategory: async function (req, res) {
    const { categoryName } = req.body;
    const category = await categoryTable.create({
      categoryName: categoryName,
    });
    return "Category Added Successfully";
  },

  deleteCategory: async function (req, res) {
    const category_id = req.body.category;
    const category = await categoryTable.findOne({ _id: category_id });
    const dir = `static/user_UI/img/categories/${category.categoryName}.png`;
    fs.unlinkSync(dir);
    category.delete();
    return "Category Deleted Successfully";
  },

  getHomePageData: async function () {
    const acceptedStores = await storeTable.countDocuments({
      status: "accepted",
    });
    const orders = await orderTable.countDocuments();
    const orderData = await orderTable.find();
    const users = await userTable.countDocuments();
    const revenue = await module.exports.getRevenue(orderData);
    const context = {
      orders: orders,
      acceptedStores: acceptedStores,
      users: users,
      revenue: revenue,
    };
    return context;
  },

  getStorePageData: async function (currentCity, status) {
    const address = await addressTable.find({ city: currentCity });
    const store_id = Array(address.length);

    for (let i = 0; i < address.length; i++) {
      store_id[i] = address[i].user_id;
    }
    const stores = await storeTable.find({
      status: status,
      _id: { $in: [...store_id] },
    });
    const pendingStores = await storeTable.find({
      status: "pending",
      _id: { $in: [...store_id] },
    });
    const locations = await getLocations();
    const context = {
      cities: locations.cities,
      pending: pendingStores,
      stores: stores,
      status: status,
      currentCity: currentCity,
    };
    return context;
  },

  // I have to get the city jedhe stores use kr reha mai.

  getProductPageData: async function (city) {
    const categories = await categoryTable.find();
    const address = await addressTable.find({ city: city });
    const store_id = Array(address.length);

    for (let i = 0; i < address.length; i++) {
      store_id[i] = address.store_id;
    }

    const stores = await storeTable.find({
      status: "accepted",
      store_id: { $in: store_id },
    });

    const acceptedStore_id = Array(stores.length);

    // const store_id2 = Array(stores.length);
    const locations = await getLocations();
    const categoryDict = {},
      storeDict = {};

    for (let i = 0; i < categories.length; i++) {
      categoryDict[categories[i]._id] = categories[i].categoryName;
    }

    for (let i = 0; i < stores.length; i++) {
      storeDict[stores[i]._id] = stores[i].storeName;
    }

    for (let i = 0; i < stores.length; i++) {
      acceptedStore_id[i] = stores[i]._id;
    }

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
      currentCity: city,
    };
    return context;
  },

  getMoneyPageData: async function (status, currentCity) {
    const stores = await storeTable.find({ city: currentCity });
    const store_id = Array(stores.length);
    for (let i = 0; i < stores.length; i++) {
      store_id[i] = stores[i]._id;
    }
    const pendingMoneyDetails = await moneyDetailTable.find({
      status: "pending",
      store_id: { $in: store_id },
    });
    console.log(pendingMoneyDetails);
    const MoneyDetails = await moneyDetailTable.find({
      status: status,
      store_id: { $in: store_id },
    });
    const unPaidAmount = module.exports.getPaymentDetails(pendingMoneyDetails);
    const totalAmount =
      module.exports.getPaymentDetails(MoneyDetails) + unPaidAmount;
    const locations = await getLocations();
    const context = {
      MoneyDetails: MoneyDetails,
      pendingMoneyDetails: pendingMoneyDetails,
      unPaidAmount: unPaidAmount,
      totalAmount: totalAmount,
      status: status,
      currentCity: currentCity,
      cities: locations.cities,
    };
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
};
