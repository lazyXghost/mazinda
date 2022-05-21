const router = require("express").Router();
const passport = require("passport");
const {authCheck,userLoggedIn} = require("../middleware/auth");
const {storeRegister} = require("../utils");

// auth login
router.get("/login",userLoggedIn, (req, res) => {
    res.render("user/login");
});

router.get("/" , (req, res) => {
    res.render("user/home",{
        authenticated: req.isAuthenticated(),
        user: req.user,
    });
});

// requests for register and login
router.get("/register",userLoggedIn,(req,res) => {
    res.render("user/register");
});

router.post("/register",storeRegister);

router.get("/login",userLoggedIn,(req,res)=>{
    res.render("user/login");
});

router.post("/login",passport.authenticate('local',{
    successRedirect: "/user/home",
    failureRedirect: "/user/login",
}));

router.get("/home",(req,res)=> {
    res.render("user/home",{
        authenticated:req.isAuthenticated(),
        user:req.user
    });
});

router.get("/contact", (req, res) => {
    res.render("store/contact");
});

router.get("/products",authCheck , (req, res) => {
    res.render("store/products",{
        authenticated: req.isAuthenticated(),
        user: req.user,
    });
});

router.get("/faqs", (req, res) => {
    res.render("user/faq");
});

router.get("/profile",authCheck, (req, res) => {
    res.render("user/profile",{
        authenticated: req.isAuthenticated(),
        user: req.user,
        token:req.body.token
    });
});

router.delete("/logout",(req,res) => {
    req.logOut();
    req.session.user = null;
    res.redirect("/login");
    console.log("User has been successfully logged out");
});



















// auth logout
router.get("/logout", (req, res) => {
    // req.session = null;
    req.logout();
    req.session.user = null;
    res.redirect("/");
});



module.exports = router;
