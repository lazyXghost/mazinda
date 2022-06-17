const router = require("express").Router();
const passport = require("passport");
const { userCheck, userLoggedIn } = require("../middleware/auth");
const {addAddress, localUserLogin } = require("../utils");
const {userRegister,getIndexPageData,getProductPageData,getOrderPageData, getProfilePageData, getCartPageData,getCartValue, placeOrder} = require("../utils/userUtils");
const productTable = require("../models/product");
const moneyDetailTable = require("../models/moneyDetail");
const orderTable = require("../models/order");
const storeTable = require("../models/store");
const walletTable = require("../models/wallet");
const userTable = require("../models/user");
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

/////////////////////////////////////////////////////////////

router.get("/", async (req, res) => {
  const context = await getIndexPageData(req,res);
  res.render("user/index", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

router.get("/index", async (req, res) => {
  const context = await getIndexPageData(req,res);
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
  const context = await getProductPageData(req,res);
  res.render("user/products", {
    authenticated: req.isAuthenticated(),
    user: req.user,
    ...context,
  });
});

router.get("/productDetail",async (req,res) => {
  const product_id = url.parse(req.url,true).query.ID;
  const product = await productTable.findOne({_id:product_id});
  const context = {
    authenticated:req.isAuthenticated(),
    user:req.user,
    product:product,
  };
  const productPage = (req.useragent.isMobile)?"mobile_product":"desktop_product";
  if(product) res.render(`user/${productPage}`,{...context});
  else res.redirect("/products");
});

/////////////////////////////////////////////////////////////
// Cart page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/viewCart",async (req,res) => {
  const context = await getCartPageData(req,res);
  const cartPage = (req.useragent.isMobile)?"mobile_cart":"desktop_cart";
  res.render(`user/${cartPage}`,{
    authenticated:req.isAuthenticated(),
    user:req.user,
    ...context,
  });
});

router.get("/addToCart",async (req,res) => {
  const temp = url.parse(req.url,true).query.ID;
  let checker=false;
  const cart = await cartTable.find({user_id:req.user._id});
  for(let i=0;i<cart.products.length;i++){
    if(temp == cart.products[i].product_id){
      cart.products[i].quantity +=1;
      cart.save();
      checker=true;
      return `product quantity increased to ${cart.products[i].quantity}`;
    }
  } 
  if(checker == false){
    const product = {
      product_id:temp,
      quantity:1,
    }
    cart.update({$push:{products:product}});
    return "product added to the cart";
  }
});

// router.get("cartQuantityUpdate", async (req,res) => {
//   // I will do it with plain javascript.
// });

/////////////////////////////////////////////////////////////
// Order page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/viewOrders",async (req,res) => {
  const context = await getOrderPageData(req,res);
  res.render("user/orders",{
    authenticated:req.isAuthenticated(),
    user:req.user,
    ...context,
  });
});

router.post("/placeOrder",async (req,res) => {
  const message = await placeOrder(req,res);
  res.render("user/orderPlaced",{
    authenticated:req.isAuthenticated(),
    user:req.user,
    message:message,
  });
});

/////////////////////////////////////////////////////////////
// Order page all functions along with filters
/////////////////////////////////////////////////////////////

router.get("/profile", userCheck, async (req, res) => {
  const context = await getProfilePageData(req,res);
  res.render("user/profile", {
    authenticated: req.isAuthenticated(),
    user:req.user,
    ...context,
  });
});

/////////////////////////////////////////////////////////////
// Contacts,FAQ and logout functions
/////////////////////////////////////////////////////////////

router.get("/contact", async (req, res) => {
  res.render("store/contact");
});

router.get("/faqs", (req, res) => {
  res.render("user/faq");
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

module.exports = router;
