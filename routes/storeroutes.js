const router = require("express").Router();
const { storeLoggedIn, storeCheck } = require("../middleware/auth");
const { storeLogIn, storeRegister } = require("../utils");

// ----- Registration and authentication for Stores -----
router.get("/login", storeLoggedIn, (req, res) => {
  res.render("store/login");
});

router.post("/login", storeLogIn);

router.get("/register", storeLoggedIn, (req, res) => {
  res.render("store/register");
});

router.post("/register", storeRegister);

// ----------- APP ROUTES ---------------

router.get("/", storeCheck, (req, res) => {
  res.render("store/dashboard", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.get("/dashboard", storeCheck, (req, res) => {
  res.render("store/dashboard");
});

router.get("/products", storeCheck, (req, res) => {
  res.render("store/products", {
    authenticated: req.isAuthenticated(),
    user: req.user,
  });
});

router.get("/profile", storeCheck, (req, res) => {
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
});

module.exports = router;
