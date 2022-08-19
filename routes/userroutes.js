const router = require("express").Router();
const passport = require("passport");
const { userCheck, userLoggedIn } = require("../middleware/auth");
const { addAddress, localUserLogin } = require("../utils");
const {
  userRegister,
  getIndexPageData,
  getProductPageData,
  getOrderPageData,
  getProfilePageData,
  getCartPageData,
  getCartValue,
  changePassword,
  placeOrder,
  updateCartQuantity,
  removeProduct,
} = require("../utils/userUtils");
const productTable = require("../models/product");
const moneyDetailTable = require("../models/moneyDetail");
const orderTable = require("../models/order");
const storeTable = require("../models/store");
const walletTable = require("../models/wallet");
const userTable = require("../models/user");
const cartTable = require("../models/cart");
const url = require("url");

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
    res.render("user/register", { message });
  } else {
    res.redirect("/login");
  }
});

router.get("/login", userLoggedIn, (req, res) => {
  res.render("user/login");
});

router.post("/login", localUserLogin);

// ----------- APP ROUTES ---------------

/////////////////////////////////////////////////////////////

router.get("/", async (req, res) => {
  const city = url.parse(req.url, true).query.city || "Mandi";
  // const city = "Mandi";
  const context = await getIndexPageData(city, res);
  res.render("user/index", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

/////////////////////////////////////////////////////////////
// products page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/products", async (req, res) => {
  const context = await getProductPageData(req, res);
  res.render("user/products", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

// router.post("/products", async (req, res) => {
//   const context = await getProductPageData(req, res);
//   res.render("user/products", {
//     authenticated: req.isAuthenticated(),
//     user: req.user,
//     ...context,
//   });
// });

router.get("/productDetail", async (req, res) => {
  const product_id = url.parse(req.url, true).query.ID;
  const product = await productTable.findOne({ _id: product_id });
  const context = {
    authenticated: req.isAuthenticated(),
    user: req.user,
    product: product,
  };
  const productPage = req.useragent.isMobile
    ? "mobile_product"
    : "desktop_product";
  if (product) res.render(`user/${productPage}`, { ...context });
  else res.redirect("/products");
});

/////////////////////////////////////////////////////////////
// Cart page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/viewCart", userCheck, async (req, res) => {
  const context = await getCartPageData(req, res);
  const cartPage = req.useragent.isMobile ? "mobile_cart" : "desktop_cart";
  res.render(`user/${cartPage}`, {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

router.get("/placeOrder", userCheck, async (req, res) => {
  const context = await getCartPageData(req, res);
  const product_id = url.parse(req.url, true).query.product_id;
  const product = await productTable.findOne({
    _id: product_id,
  });
  product.availableQuantity = 1;
  context.products = [product];
  const cartPage = req.useragent.isMobile ? "mobile_cart" : "desktop_cart";
  res.render(`user/${cartPage}`, {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

router.get("/addToCart", userCheck, async (req, res) => {
  const params = url.parse(req.url, true).query;
  const product_id = params.product_id;
  const user_id = params.user_id;
  const product = await productTable.findOne({ _id: product_id });
  const cart = await cartTable.findOne({ user_id: user_id });
  const category_id = product.category_id;
  let checker = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (product_id == cart.products[i].product_id) {
      cart.products[i].quantity += 1;
      cart.save();
      checker = true;
    }
  }
  if (cart.products.length == 0) {
    const cartProduct = {
      product_id: product_id,
      quantity: 1,
    };
    cart.category_id = category_id;
    await cart.update({ $push: { products: cartProduct } });
    cart.save();
  } else if (checker == false && cart.category_id == category_id) {
    const product = {
      product_id: product_id,
      quantity: 1,
    };
    await cart.update({ $push: { products: product } });
  }
  return res.send("added product to cart");
});

router.get("/updateCartQuantity", userCheck, async (req, res) => {
  await updateCartQuantity(req, res);
  res.redirect("/viewCart");
});

router.get("/removeProduct", userCheck, async (req, res) => {
  await removeProduct(req, res);
  res.redirect("/viewCart");
});

/////////////////////////////////////////////////////////////
// Order page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/viewOrders", userCheck, async (req, res) => {
  const context = await getOrderPageData(req, res);
  res.render("user/orders", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

router.post("/placeOrder", userCheck, async (req, res) => {
  const message = await placeOrder(req, res);
  res.render("user/orderPlaced", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    message: message,
  });
});

/////////////////////////////////////////////////////////////
// Order page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/profile", userCheck, async (req, res) => {
  const context = await getProfilePageData(req, res);
  res.render("user/profile", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

router.post("/changePassword", userCheck, async (req, res) => {
  const message = await changePassword(req, res);
  if (
    message == "password is too Short." ||
    message == "invalid password" ||
    message == "passwords do not match"
  ) {
    res.redirect("/profile");
    // res.render("store/profile", {
    //   authenticated: req.isAuthenticated(),
    //   user: req.user,
    //   message: message,
    // });
  } else {
    res.redirect("/");
  }
});

/////////////////////////////////////////////////////////////
// Address functions
/////////////////////////////////////////////////////////////

router.get("/addAddress", userCheck, async (req, res) => {
  res.render("user/address");
});

router.post("/addAddress", userCheck, async (req, res) => {
  const message = addAddress(req, req.user._id);
  res.redirect("/viewCart");
});

/////////////////////////////////////////////////////////////
// Contacts,FAQ and logout functions
/////////////////////////////////////////////////////////////

router.get("/contact", async (req, res) => {
  res.render("store/contact");
});

router.get("/settings", userCheck, (req, res) => {
  res.render("user/settings");
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

module.exports = router;
