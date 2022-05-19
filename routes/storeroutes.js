const router = require("express").Router();
const passport = require("passport");
const { shopLoggedIn, shopCheck } = require("../middleware/auth");
const { register } = require("../utils");

// <----Registration and authentication for Shops----->
router.get("/register", shopLoggedIn, (req, res) => {
  res.render("store/register");
});

router.post("/register", register);

router.get("/login", shopLoggedIn, (req, res) => {
  res.render("store/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/store/dashboard",
    failureRedirect: "/store/login",
  })
);

// <----------- APP ROUTES --------------->

router.get("/", shopCheck, (req, res) => {
  res.render("store/dashboard", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.get("/dashboard", shopCheck, (req, res) => {
  res.render("store/dashboard");
});

router.get("/products", shopCheck, (req, res) => {
  res.render("store/products", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.get("/profile", shopCheck, (req, res) => {
  res.render("store/profile", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    token: req.body.token,
  });
});

router.get("/contact", (req, res) => {
  res.render("store/contact");
});


router.get("/faqs", (req, res) => {
  res.render("store/faq");
});

// Logging Out
router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
  console.log("User has been successfully logged out");
});

module.exports = router;
