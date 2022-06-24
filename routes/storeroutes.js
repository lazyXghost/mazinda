const router = require("express").Router();
const fs = require("fs");
const addressTable = require("../models/address");
const productTable = require("../models/product");
const storeTable = require("../models/store");
const moneyDetailsTable = require("../models/moneyDetail");
const categoryTable = require("../models/category");
const url = require("url");
const path = require("path");
const multer = require("multer");
const { storeLoggedIn, storeCheck } = require("../middleware/auth");
const { storeRegister, localStoreLogin } = require("../utils");
const {
  addProduct,
  updateQuantity,
  deleteProduct,
  changePassword,
  getRevenue,
} = require("../utils/storeUtils");
const { findOne, findOneAndUpdate } = require("../models/category");
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname));
    },
  }),
});

// <----Registration and authentication for stores----->
router.get("/register", storeLoggedIn, (req, res) => {
  res.render("store/register");
});

router.post("/register", async (req, res) => {
  const message = await storeRegister(req, res);
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
  const moneyDetails = await moneyDetailsTable.find({store_id:req.user._id});
  const salesTime = url.parse(req.url,true).query.salesTime || "Month";
  const revenueTime = url.parse(req.url,true).query.revenueTime || "Month";
  const tableTime = url.parse(req.url,true).query.tableTime || "Month";
  const {revenue,sales,tableDetails} = await getRevenue(moneyDetails,salesTime,revenueTime,tableTime);
  const context = {
    authenticated: req.isAuthenticated(),
    user: req.user,
    revenue:revenue,
    sales:sales,
    salesTime:salesTime,
    revenueTime:revenueTime,
    tableTime:tableTime,
    tableDetails:tableDetails,
  }
  res.render("store/dashboard", {...context});
});

router.get("/dashboard", storeCheck, async (req, res) => {
  const moneyDetails = await moneyDetailsTable.find({store_id:req.user._id});
  const salesTime = url.parse(req.url,true).query.salesTime || "Month";
  const revenueTime = url.parse(req.url,true).query.revenueTime || "Month";
  const tableTime = url.parse(req.url,true).query.tableTime || "Month";
  const {revenue,sales,tableDetails} = await getRevenue(moneyDetails,salesTime,revenueTime,tableTime);
  const context = {
    authenticated: req.isAuthenticated(),
    user: req.user,
    revenue:revenue,
    sales:sales,
    salesTime:salesTime,
    revenueTime:revenueTime,
    tableTime:tableTime,
    tableDetails:tableDetails,
  }
  res.render("store/dashboard", {...context});
});

router.get("/products", storeCheck, async (req, res) => {
  const products = await productTable.find({ store_id: req.user._id });
  const context = {
    products: products,
    user: req.user,
    authenticated: req.isAuthenticated(),
  };
  console.log(req.user);
  res.render("store/products", { ...context });
});

router.get("/addProduct", storeCheck, async (req, res) => {
  const category = await categoryTable.find();
  res.render("store/addProduct", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    category: category,
  });
});

router.post(
  "/addProduct",
  upload.array("images"),
  storeCheck,
  async (req, res) => {
    req.body.images = [];
    for(let i=0;i<req.files.length;i++){
      const image = {
        data:fs.readFileSync(req.files[i].filename),
        contentType:"image/png",
      }
      fs.unlinkSync(req.files[i].filename);
      req.body.images.push(image);
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
  await updateQuantity(req,res);
  res.redirect("/store/products");
});

router.get("/deleteProduct", storeCheck, async (req, res) => {
  await deleteProduct(req,res);
  res.redirect("/store/products");
});

router.post("/changePassword", storeCheck, async (req, res) => {
  const message = await changePassword(req, res);
  if (
    message == "password is too Short." ||
    message == "invalid password" ||
    message == "passwords do not match"
  ) {
    console.log(message);
    res.redirect("/store/dashboard");
    // res.render("store/profile", {
    //   authenticated: req.isAuthenticated(),
    //   user: req.user,
    //   message: message,
    // });
  } else {
    res.redirect("/store/dashboard");
  }
});

router.get("/profile", storeCheck, async (req, res) => {
  const address = await addressTable.findOne({ user_id: req.user._id });
  console.log(address);
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

// Logging Out
router.get("/logout", storeCheck, (req, res) => {
  req.logOut();
  res.redirect("/login");
});

module.exports = router;
