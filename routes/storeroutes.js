const router = require("express").Router();
const passport = require("passport");
const fs = require('fs');
const addressTable = require("../models/address");
const productTable = require("../models/product");
const multer = require('multer')
const { storeLoggedIn, storeCheck } = require("../middleware/auth");
const { storeRegister,localStoreLogin, addProduct} = require("../utils");
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
  }) 
});

// <----Registration and authentication for stores----->
router.get("/register", storeLoggedIn, (req, res) => {
  res.render("store/register");
});

router.post("/register", async (req,res) => {
  const message = await storeRegister(req);
  if(message == "Password is too Short"){   
    res.render("store/register", {message});
  } else {
    res.redirect('/store/login');
  }
});

router.get("/login", storeLoggedIn, (req, res) => {
  res.render("store/login");
});

router.post("/login", localStoreLogin);

// ----------- APP ROUTES ---------------

router.get("/", storeCheck, (req, res) => {
  res.render("store/dashboard", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.get("/dashboard", storeCheck, (req, res) => {
  res.render("store/dashboard", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.get("/products", storeCheck, async (req, res) => {
  const products = await productTable.find({store_id: req.user._id});
  const context = {
    "products" : products
  };
  console.log(req.user);
  res.render("store/products", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

router.get("/addProduct", storeCheck, async (req, res) => {
  res.render("store/addProduct", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.post("/addProduct", upload.single('image'), storeCheck, async (req, res) => {
  req.body.image = {
    data: fs.readFileSync('uploads/' + req.file.filename),
    contentType: 'image/png'
  }
  req.body.store_id = req.user._id;
  req.body.category_id = "fake_id";
  await addProduct(req.body, "pending");
  res.redirect("/store/products");
});

router.get("/deleteProduct", storeCheck, async (req, res) => {
  var product_id = url.parse(req.url, true).query.ID;
  await productTable.deleteOne({ _id: product_id});
  res.redirect("/store/products");
});

router.get("/profile", storeCheck, async (req, res) => {
  const address = await addressTable.findOne({user_id:req.user._id});
  console.log(address);
  res.render("store/profile", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    address:address,
  });
});

router.get("/contact", (req, res) => {
  res.render("store/contact",{
    user:req.user,
    authenticated:req.isAuthenticated(),
  });
});


router.get("/faqs", (req, res) => {
  res.render("store/faq",{
    user:req.user,
    authenticated:req.isAuthenticated(),
  });
});

// Logging Out
router.get("/logout",storeCheck, (req, res) => {
  req.logOut();
  res.redirect("/login");
});

module.exports = router;
