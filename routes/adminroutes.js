const router = require("express").Router();
const req = require("express/lib/request");
const res = require("express/lib/response");
const { adminCheck, adminLoggedIn } = require("../middleware/auth");
const {
  getLocations,
  localAdminLogin,
  storeRegister,
  getHomePageData,
  getStorePageData,
  changeStatus,
  getProductPageData,
} = require("../utils");

// ----- Authentication for Admin -----
router.get("/login", adminLoggedIn, (req, res) => {
  res.render("admin/login");
});
router.post("/login", localAdminLogin);

// ----------- APP ROUTES ---------------

router.get("/", adminCheck, async (req, res) => {
  const context = await getHomePageData();
  res.render("admin/home", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/store", adminCheck, async (req, res) => {
  let [status,currentCity] = ['accepted','Mandi'];
  const context = await getStorePageData(currentCity,status);
  res.render("admin/store", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.post("/store", adminCheck, async (req, res) => {
  let [status,currentCity] = ['accepted','Mandi'];
  if(req.body.status) status = req.body.status;
  if(req.body.currentCity) currentCity = req.body.currentCity;
  const context = await getStorePageData(currentCity,status);
  res.render("admin/store", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/storeStatusChange", adminCheck, async (req, res) => {
  await changeStatus(req);
  return res.redirect("/admin/store");
});

// router.post("/cityFilter",adminCheck,async (req,res) => {

// });

// router.post("/statusFilter",adminCheck,async (req,res) => {

// });

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

router.get("/products", adminCheck, async (req, res) => {
  const context = await getProductPageData("Mandi");
  res.render("admin/products", {
    user: req.user,
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

// router.get("/coupon", adminCheck, (req, res) => {
//     res.render("admin/coupon", {
//         user: req.user,
//         authenticated: req.isAuthenticated(),
//     });

// })
// router.get("/category",adminCheck , (req, res)=>{
//     res.render("admin/category", {
//         user: req.user,
//         authenticated: req.isAuthenticated(),
//     });
// });

// router.get("/addCategory",adminCheck , (req, res)=>{
//     res.render("admin/category", {
//         user: req.user,
//         authenticated: req.isAuthenticated(),
//     });
// });
// allows filtering of the products according to the admin's choice.
// router.post("/products", adminCheck, async (req,res) => {
//     const {city} = req.body;
//     const context =await  getProductPageData(city);
//     res.render("admin/products",{
//         user:req.user,
//         authenticated:req.isAuthenticated(),
//         ...context,
//     });
// });

// router.get("/money", adminCheck,(req, res)=>{
//     res.render("admin/money", {
//         user: req.user,
//         authenticated: req.isAuthenticated(),
//     });
// });

module.exports = router;
