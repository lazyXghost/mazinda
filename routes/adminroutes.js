const router = require("express").Router();
const { adminCheck, adminLoggedIn } = require("../middleware/auth");
const url = require("url");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  localAdminLogin,
  storeRegister,
  getLocations,
  getCategories,
} = require("../utils");
const {
  getHomePageData,
  getStorePageData,
  getMoneyPageData,
  getProductPageData,
  productDetailsChange,
  storeStatusChange,
  moneyDetailStatusChange,
  addCategory,
  deleteCategory,
} = require("../utils/adminUtils");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "static/user_UI/img/categories");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.categoryName + ".png"); // TODO : may have to be improved.
    },
  }),
});
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "");
//     },
//     filename: (req, file, cb) => {
//       cb(null, file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname));
//     },
//   }),
// });
// ----- Authentication for Admin -----
router.get("/login", adminLoggedIn, (req, res) => {
  res.render("admin/login");
});
router.post("/login", localAdminLogin);

// ----------- APP ROUTES ---------------

/////////////////////////////////////////////////////////////

router.get("/", adminCheck, async (req, res) => {
  const context = await getHomePageData();
  res.render("admin/home", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

/////////////////////////////////////////////////////////////
// store page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/store", adminCheck, async (req, res) => {
  const status = url.parse(req.url, true).query.status ?? "accepted";
  const currentCity = url.parse(req.url, true).query.currentCity ?? "Mandi";
  const context = await getStorePageData(currentCity, status);
  res.render("admin/store", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/storeStatusChange", adminCheck, async (req, res) => {
  await storeStatusChange(req);
  return res.redirect("/admin/store");
});

router.get("/addStore", adminCheck, async (req, res) => {
  const message = "";
  const { cities, states } = await getLocations();

  const context = {
    cities: cities,
    states: states,
    message: message,
  };
  res.render("admin/addStore", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.post("/addStore", adminCheck, async (req, res) => {
  const message = await storeRegister(req, res);
  res.redirect("/admin/addStore");
});

////////////////////////////////////////////////////////////
// Product Page functions
///////////////////////////////////////////////////////////

router.get("/products", adminCheck, async (req, res) => {
  const currentCity = url.parse(req.url, true).query.currentCity ?? "Mandi";
  const context = await getProductPageData(currentCity);
  res.render("admin/products", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/productDetailsChange", adminCheck, async (req, res) => {
  await productDetailsChange(req);
  return res.redirect("/admin/products");
});

/////////////////////////////////////////////////////////////////
// Category Page functions
/////////////////////////////////////////////////////////////////

router.get("/category", adminCheck, async (req, res) => {
  const category = await getCategories();
  res.render("admin/category", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    category: category,
  });
});

router.post("/addCategory", upload.single("image"), async (req, res) => {
  await addCategory(req, res);
  res.redirect("/admin/category");
});

router.post("/deleteCategory", adminCheck, async (req, res) => {
  await deleteCategory(req, res);
  res.redirect("/admin/category");
});

/////////////////////////////////////////////////////////////
// Money Management functions
/////////////////////////////////////////////////////////////

router.get("/money", adminCheck, async (req, res) => {
  const status = url.parse(req.url, true).query.status ?? "accepted";
  const currentCity = url.parse(req.url, true).query.currentCity ?? "Mandi";
  const context = await getMoneyPageData(status, currentCity);
  res.render("admin/money", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/moneyDetailStatusChange", adminCheck, async (req, res) => {
  await moneyDetailStatusChange(req);
  res.redirect("/admin/money");
});

//////////////////////////////////////////////////////////////
// Coupon Page functions
/////////////////////////////////////////////////////////////
router.get("/coupon", adminCheck, (req, res) => {
  res.render("admin/coupon", {
    user: req.user,
    authenticated: req.isAuthenticated(),
  });
});

module.exports = router;
