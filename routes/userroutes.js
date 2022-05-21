const router = require("express").Router();

// const passport = require("passport");
const {userCheck} = require("../middleware/auth");
// const {storeRegister} = require("../utils");


router.get("/" , userCheck, (req, res) => {
    res.render("index",{
        authenticated: req.isAuthenticated(),
        user: req.user,
    });
});

// requests for register and login
// router.get("/register",userLoggedIn,(req,res) => {
//     res.render("user/register");
// });

// router.post("/register",storeRegister);

router.get("/login",(req,res)=>{
    res.render("index");
});

// router.post("/login",passport.authenticate('local',{
//     successRedirect: "/user/home",
//     failureRedirect: "/user/login",
// }));

// router.get("/home",(req,res)=> {
//     res.render("user/home",{
//         authenticated:req.isAuthenticated(),
//         user:req.user
//     });
// });

// router.get("/contact", (req, res) => {
//     res.render("store/contact");
// });

// router.get("/products",authCheck , (req, res) => {
//     res.render("store/products",{
//         authenticated: req.isAuthenticated(),
//         user: req.user,
//     });
// });

// router.get("/faqs", (req, res) => {
//     res.render("user/faq");
// });

// router.get("/profile",authCheck, (req, res) => {
//     res.render("user/profile",{
//         authenticated: req.isAuthenticated(),
//         user: req.user,
//         token:req.body.token
//     });
// });

router.get("/logout",(req,res) => {
    req.logOut();
    res.redirect("/");
});

module.exports = router;
