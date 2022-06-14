const router = require("express").Router();
const passport = require("passport");
const { userCheck, userLoggedIn } = require("../middleware/auth");
const { userRegister, addAddress, localUserLogin } = require("../utils");
const productTable = require("../models/product");
const walletTable = require("../models/wallet");
const userTable = require("../models/user");

// <----Registration and authentication for stores----->
router.get("/register", userLoggedIn, (req, res) => {
  res.render("user/register");
});

router.post("/register", async (req, res) => {
  const message = await userRegister(req);
  if (
    message == "Password is too Short" ||
    message == "Invalid Referral Code" ||
    message == "user already Exists"
  ) {
    res.render("store/register", { message });
  } else {
    res.redirect("/store/login");
  }
});

router.get("/login", userLoggedIn, (req, res) => {
  res.render("user/login");
});

router.post("/login", localUserLogin);

// ----------- APP ROUTES ---------------

router.get("/", async (req, res) => {
  const products = await productTable.find({status:"accepted"});
  res.render("user/index", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    products,
  });
});

router.get("/index", async (req, res) => {
  const products = await productTable.find({ status: "accepted" });
  res.render("user/index", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    products,
  });
});

router.get("/contact", (req, res) => {
  res.render("store/contact");
});

router.get("/products", userCheck, (req, res) => {
  res.render("store/products", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.get("/faqs", (req, res) => {
  res.render("user/faq");
});
// profile contains the name,phonenumber,email,walletBalance,

router.get("/profile", userCheck, async (req, res) => {
    const wallets = await walletTable.find();
    console.log(wallets);
    const user = await userTable.findOne({_id:wallets[0].user_id});
    console.log(user);
    const wallet = await walletTable.findOne({user_id:req.user._id});
    const context = {
        user:req.user,
        wallet:wallet,
    }
    console.log(wallet,"is  null");
    console.log(req.user);
  res.render("user/profile", {
    authenticated: req.isAuthenticated(),
    ...context,
  });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

// auth logout
router.get("/logout", (req, res) => {
  // req.session = null;
  req.logout();
  req.session.user = null;
  res.redirect("/");
});

module.exports = router;
