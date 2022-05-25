const router = require("express").Router();
const req = require("express/lib/request");
const res = require("express/lib/response");
const categoryTable = require("../models/category");
const { adminCheck, adminLoggedIn } = require("../middleware/auth");
const {
  getLocations,
  localAdminLogin,
  storeRegister,
  getHomePageData,
  getStorePageData,
  storeStatusChange,
  productStatusChange,
  getProductPageData,
  getMoneyPageData,
  deleteCategory,
  addCategory,
} = require("../utils");

// ----- Authentication for Admin -----
router.get("/login", adminLoggedIn, (req, res) => {
  res.render("admin/login");
});
router.post("/login", localAdminLogin);

// ----------- APP ROUTES ---------------

// home page done.
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
  const status = req.body.status ?? "accepted";
  const currentCity = req.body.currentCity ?? "Mandi";
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
  const currentCity = req.body.currentCity ?? "Mandi";
  const context = await getProductPageData(currentCity);
  res.render("admin/products", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/productStatusChange", adminCheck, async (req, res) => {
  await productStatusChange(req);
  return res.redirect("/admin/products");
});

/////////////////////////////////////////////////////////////////
// Category Page functions
/////////////////////////////////////////////////////////////////

router.get("/category", adminCheck, async (req, res) => {
  const category = await categoryTable.find();
  res.render("admin/category", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    category:category,
  });
});

router.post("/addCategory", adminCheck, async (req, res) => {
  await addCategory(req, res);
  res.redirect("/admin/category");
});

router.post("/deleteCategory",adminCheck,async (req,res) => {
  await deleteCategory(req,res);
  res.redirect("/admin/category");
})

/////////////////////////////////////////////////////////////
// Money Management functions
/////////////////////////////////////////////////////////////

router.get("/money", adminCheck,async (req, res)=>{
  const context = await getMoneyPageData(req.body.status ?? 'accepted');
    res.render("admin/money", {
        user: req.user,
        authenticated: req.isAuthenticated(),
        ...context,
    });
});

router.get("/moneyDetailStatusChange", adminCheck,async(req,res) => {
  await moneyDetailStatusChange(req);
  res.redirect("/admin/money");
});

//////////////////////////////////////////////////////////////
// Coupon Page functions
/////////////////////////////////////////////////////////////
// router.get("/coupon", adminCheck, (req, res) => {
//     res.render("admin/coupon", {
//         user: req.user,
//         authenticated: req.isAuthenticated(),
//     });

// })
// allows filtering of the products according to the admin's choice.

// router.get("/money", adminCheck,(req, res)=>{
//     res.render("admin/money", {
//         user: req.user,
//         authenticated: req.isAuthenticated(),
//     });
// });

module.exports = router;
