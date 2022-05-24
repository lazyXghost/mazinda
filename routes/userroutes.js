const router = require("express").Router();
const passport = require("passport");
const {userCheck,userLoggedIn} = require("../middleware/auth");
const {userRegister,addAddress} = require("../utils");
const productTable = require("../models/product");

// auth login
router.get("/login",userLoggedIn, (req, res) => {
    res.render("user/login");
});

router.get("/" , async (req, res) => {
    const products = await productTable.find();
    res.render("user/index",{
        authenticated:req.isAuthenticated(),
        user:req.user,
        products,
    });
});

// requests for register and login
router.get("/register",userLoggedIn,(req,res) => {
    res.render("user/register");
});

router.post("/register",userRegister);

router.get("/login",userLoggedIn,(req,res)=>{
    res.render("user/login");
});

router.post("/login",passport.authenticate('local',{
    successRedirect: "/user/index",
    failureRedirect: "/user/login",
}));

router.get("/index",async (req,res)=> {
    const products = await productTable.find({status:'accepted'});
    res.render("user/index",{
        authenticated:req.isAuthenticated(),
        user:req.user,
        products,
    });
});

router.get("/contact", (req, res) => {
    res.render("store/contact");
});

router.get("/products", userCheck , (req, res) => {
    res.render("store/products",{
        authenticated: req.isAuthenticated(),
        user: req.user,
    });
});

router.get("/faqs", (req, res) => {
    res.render("user/faq");
});

router.get("/profile",userCheck, (req, res) => {
    res.render("user/profile",{
        authenticated: req.isAuthenticated(),
        user: req.user,
        token:req.body.token
    });
});

router.get("/logout",(req,res) => {
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
