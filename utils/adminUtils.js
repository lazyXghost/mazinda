const storeTable = require("../models/store");
const categoryTable = require("../models/category");
const productTable = require("../models/product");
const orderTable = require("../models/order");
const userTable = require("../models/user");
const moneyDetailTable = require("../models/moneyDetail");
const paymentTable = require("../models/payment");
const addressTable = require("../models/address");
const url = require("url");
const fs = require("fs");
const { getLocations } = require("../utils");
const multer = require("multer");

module.exports = {
  addPayment: async function (req) {
    let { moneyDetails, image } = req.body;
    moneyDetails = await JSON.parse(moneyDetails);
    console.log(moneyDetails);
    if (moneyDetails.length == 0) return;
    const moneyDetailsData = [];
    let mrp = 0,
      costPrice = 0,
      salePrice = 0;
    const moneyDetails_id = Array(moneyDetails.length);
    for (let i = 0; i < moneyDetails.length; i++) {
      moneyDetails_id[i] = moneyDetails[i]._id;
    }
    const pendingMoneyDetails = await moneyDetailTable.find({
      _id: { $in: [...moneyDetails_id] },
    });
    console.log(pendingMoneyDetails);
    for (let i = 0; i < pendingMoneyDetails.length; i++) {
      pendingMoneyDetails[i].status = "accepted";
      mrp += pendingMoneyDetails[i].mrp * pendingMoneyDetails[i].quantity;
      costPrice +=
        pendingMoneyDetails[i].costPrice * pendingMoneyDetails[i].quantity;
      salePrice +=
        pendingMoneyDetails[i].salePrice * pendingMoneyDetails[i].quantity;
      pendingMoneyDetails[i].save();
    }
    for (let i = 0; i < moneyDetails_id.length; i++) {
      const moneyDetail = { moneyDetail_id: moneyDetails_id[i] };
      moneyDetailsData.push(moneyDetail);
    }
    console.log(moneyDetailsData);
    const paymentNumber = (await paymentTable.countDocuments()) + 1;
    await paymentTable.create({
      store_id: pendingMoneyDetails[0].store_id,
      moneyDetails: moneyDetailsData,
      paymentProof: image,
      paymentNumber: paymentNumber,
      mrp: mrp,
      costPrice: costPrice,
      salePrice: salePrice,
    });
    return "payment details successfully created";
  },
  getRevenue: async function (orders) {
    let totalRevenue = 0;
    for (var i = 0; i < orders.length; i++) {
      let order = orders[i];
      totalRevenue += order.amount;
    }
    return totalRevenue;
  },

  getPaymentDetails: function (payments) {
    if (payments.length && payments[0].status == "returned") return 0;
    let unPaidAmount = 0;
    let mrpTotal = 0;
    let totalSales = 0;
    for (let i = 0; i < payments.length; i++) {
      unPaidAmount += payments[i].costPrice * payments[i].quantity;
      mrpTotal += payments[i].mrp * payments[i].quantity;
      totalSales += payments[i].salePrice * payments[i].quantity;
    }
    const context = {
      unPaidAmount: unPaidAmount,
      mrpTotal: mrpTotal,
      totalSales: totalSales,
    };
    return context;
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

  getMoneyStorePageData: async function (currentCity) {
    const stores = await storeTable.find({ city: currentCity });
    const locations = await getLocations();
    const context = {
      stores: stores,
      currentCity: currentCity,
      cities: locations.cities,
    };
    return context;
  },

  getMoneyPaymentPageData: async function (currentStore) {
    const pendingMoneyDetails = await moneyDetailTable.find({
      status: "pending",
      store_id: currentStore,
    });
    const payments = await paymentTable.find({ store_id: currentStore });
    const paymentDetails = [];
    for (let i = 0; i < payments.length; i++) {
      const moneyDetails_id = Array(payments[i].moneyDetails.length);
      for (let j = 0; j < payments[i].moneyDetails.length; j++) {
        moneyDetails_id[j] = payments[i].moneyDetails[j].moneyDetail_id;
      }
      const moneyDetailsData = await moneyDetailTable.find({
        _id: { $in: [...moneyDetails_id] },
      });
      console.log(moneyDetails_id);
      paymentDetails.push(moneyDetailsData);
    }
    const { unPaidAmount, mrpTotal, totalSales } =
      module.exports.getPaymentDetails(pendingMoneyDetails);
    const locations = await getLocations();
    const context = {
      pendingMoneyDetails: pendingMoneyDetails,
      pendingMoneyDetailsJSON: JSON.stringify(pendingMoneyDetails),
      unPaidAmount: unPaidAmount,
      payments: payments,
      paymentDetails: JSON.stringify(paymentDetails),
      paymentsJSON: JSON.stringify(payments),
      totalSales: totalSales,
      mrpTotal: mrpTotal,
      currentStore: currentStore,
      cities: locations.cities,
    };
    return context;
  },
};
