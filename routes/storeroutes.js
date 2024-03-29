const router = require("express").Router();
const addressTable = require("../models/address");
const productTable = require("../models/product");
const moneyDetailsTable = require("../models/moneyDetail");
const categoryTable = require("../models/category");
const url = require("url");
const path = require("path");
const multer = require("multer");
const { storeLoggedIn, storeCheck } = require("../middleware/auth");
const { storeRegister, localStoreLogin } = require("../utils/utils");
const {
  addProduct,
  updateQuantity,
  deleteProduct,
  changePassword,
  getRevenue,
  getMoneyPageData,
} = require("../utils/storeUtils");
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "static/store_UI/img");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname +
          "-" +
          Date.now() +
          "-" +
          path.extname(file.originalname)
      );
    },
  }),
});

// <----Registration and authentication for stores----->
router.get("/register", storeLoggedIn, (req, res) => {
  res.render("store/register");
});

router.post("/register", async (req, res) => {
  const message = await storeRegister(req, res);
  console.log(message);
  if (message == "Password is too Short") {
    res.render("store/register", { message });
  } else {
    res.redirect("/store/login");
  }
});

router.get("/login", storeLoggedIn, (req, res) => {
  res.render("store/login");
});

router.post("/login", localStoreLogin);

// ----------- APP ROUTES ---------------

router.get("/", storeCheck, async (req, res) => {
  const moneyDetails = await moneyDetailsTable.find({ store_id: req.user._id });
  const salesTime = url.parse(req.url, true).query.salesTime || "Month";
  const revenueTime = url.parse(req.url, true).query.revenueTime || "Month";
  const tableTime = url.parse(req.url, true).query.tableTime || "Month";
  const { revenue, sales, tableDetails } = await getRevenue(
    moneyDetails,
    salesTime,
    revenueTime,
    tableTime
  );
  const context = {
    authenticated: req.isAuthenticated(),
    user: req.user,
    revenue: revenue,
    sales: sales,
    salesTime: salesTime,
    revenueTime: revenueTime,
    tableTime: tableTime,
    tableDetails: tableDetails,
  };
  console.log(context);
  res.render("store/dashboard", { ...context });
});

router.get("/products", storeCheck, async (req, res) => {
  const products = await productTable.find({ store_id: req.user._id });
  const context = {
    products: products,
    user: req.user,
    authenticated: req.isAuthenticated(),
  };
  res.render("store/products", { ...context });
});

router.get("/stock", storeCheck, async (req, res) => {
  const category = await categoryTable.find();
  res.render("store/addstock", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    category: category,
  });
});

router.get("/stock/addProduct", storeCheck, async (req, res) => {
  const category = await categoryTable.find();
  res.render("store/addProduct", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    category: category,
  });
});

router.post(
  "/stock/addProduct",
  upload.array("images"),
  storeCheck,
  async (req, res) => {
    console.log(req.body);
    req.body.images = [];
    for (let i = 0; i < req.files.length; i++) {
      req.body.images.push(req.files[i].filename);
    }
    const element = await categoryTable.findOne({
      categoryName: req.body.categoryName,
    });
    req.body.store_id = req.user._id;
    req.body.category_id = element._id;
    await addProduct(req.body, "pending");
    await element.update({ quantity: element.quantity + 1 });
    res.redirect("/store/products");
  }
);

router.get("/updateQuantity", storeCheck, async (req, res) => {
  await updateQuantity(req, res);
  res.redirect("/store/products");
});

router.get("/deleteProduct", storeCheck, async (req, res) => {
  await deleteProduct(req, res);
  res.redirect("/store/products");
});

router.post("/changePassword", storeCheck, async (req, res) => {
  const message = await changePassword(req, res);
  if (
    message == "password is too Short." ||
    message == "invalid password" ||
    message == "passwords do not match"
  ) {
    res.redirect("/store/dashboard");
  } else {
    res.redirect("/store/dashboard");
  }
});

router.get("/profile", storeCheck, async (req, res) => {
  const address = await addressTable.findOne({ user_id: req.user._id });
  res.render("store/profile", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    address: address,
  });
});

router.get("/contact", (req, res) => {
  res.render("store/contact", {
    user: req.user,
    authenticated: req.isAuthenticated(),
  });
});

router.get("/faqs", (req, res) => {
  res.render("store/faq", {
    user: req.user,
    authenticated: req.isAuthenticated(),
  });
});

router.get("/money", storeCheck, async (req, res) => {
  const context = await getMoneyPageData(req.user._id);
  res.render("store/money", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

// Logging Out
router.get("/logout", storeCheck, (req, res) => {
  req.logOut();
  res.redirect("/store/login");
});

module.exports = router;
