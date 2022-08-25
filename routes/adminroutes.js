const locationTable = require("../models/location");
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
  addPayment,
  getHomePageData,
  getStorePageData,
  getMoneyStorePageData,
  getMoneyPaymentPageData,
  getProductPageData,
  productDetailsChange,
  storeStatusChange,
  moneyDetailStatusChange,
  addCategory,
  deleteCategory,
  addLocation,
  deleteLocation,
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

const upload2 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now());
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
// Location Page functions
/////////////////////////////////////////////////////////////

router.get("/location", adminCheck, async (req, res) => {
  const location = await locationTable.find();
  res.render("admin/location", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    location: location,
  });
});

router.post("/addLocation", async (req, res) => {
  await addLocation(req, res);
  res.redirect("/admin/location");
});

router.post("/deleteLocation", adminCheck, async (req, res) => {
  await deleteLocation(req, res);
  res.redirect("/admin/location");
});

/////////////////////////////////////////////////////////////
// Money Management functions
/////////////////////////////////////////////////////////////

router.get("/moneyStore", adminCheck, async (req, res) => {
  const currentCity = url.parse(req.url, true).query.currentCity ?? "Mandi";
  const context = await getMoneyStorePageData(currentCity);
  res.render("admin/moneyStore", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/moneyPayment", adminCheck, async (req, res) => {
  const currentStore = url.parse(req.url, true).query.currentStore ?? "";
  const context = await getMoneyPaymentPageData(currentStore);
  res.render("admin/moneyPayment", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.post(
  "/moneyDetailStatusChange",
  upload2.single("image"),
  adminCheck,
  async (req, res) => {
    console.log(req.body);
    const image = {
      data: fs.readFileSync(req.file.filename),
      contentType: "image/png",
    };
    fs.unlinkSync(req.file.filename);
    req.body.image = image;

    await addPayment(req);
    res.redirect("/admin/moneyStore");
  }
);

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
