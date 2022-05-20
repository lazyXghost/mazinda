const router = require("express").Router();
const { adminCheck,adminLoggedIn } = require("../middleware/auth");
const { getLocations,getProducts } = require("../utils");

// app.get("/adminLogin",(req,res) => {
//     if(req.session.user == null){
//         user = {
//             status:0,
//         };
//         req.session.user = user;

//         // adminloginPage
//         res.render("adminpage", {
//             authenticated: req.isAuthenticated(),
//             user: req.session.user,
//         });
//     }
// });

router.get("/", adminCheck, async (req, res) => {
    res.render("admin/home", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
});

router.get("/login", adminLoggedIn,(req, res) => {
    req.session.admin == "0";
    res.render("admin/login");
});

// router.post("/auth", (req, res) => {
//     if (
//         req.body.email == process.env.ADMINEMAIL &&
//         req.body.password == process.env.ADMINPASSWORD
//     ) {
//         req.session.admin = "1";
//         res.render("admin/adminoption.ejs");
//     } else {
//         res.redirect("/adminlogin");
//     }
// });

router.get("/store", adminCheck, (req, res) => {
    const context = {
        "cities": ["indore", "IIT mandi","Chandigarh"],
        "products":[
            {
                "name":"Aniket's Shop",
                "ownerName":"Aniket",
                "pincode":"175005",
            }
        ],
        "rejected":[
            {
                "name":"Aniket's Shop",
                "ownerName":"Aniket",
                "pincode":"175005",
            }
        ],
    }

    res.render("admin/store",{
        user :req.user,
        authenticated: req.isAuthenticated(),
        ... context,
    });    
});

router.get("/coupon", adminCheck, (req, res) => {
    res.render("admin/coupon", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
    
})
router.get("/category",adminCheck , (req, res)=>{
    res.render("admin/category", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
});

router.get("/addCategory",adminCheck , (req, res)=>{
    res.render("admin/category", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
});

router.get("/products", adminCheck, getProducts);

router.get("/money", adminCheck,(req, res)=>{ 
    res.render("admin/money", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
})
router.get("/addstore", adminCheck, getLocations);  

module.exports = router;
