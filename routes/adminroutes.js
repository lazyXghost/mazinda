const router = require("express").Router();
const { adminCheck,adminLoggedIn } = require("../middleware/auth");
const { adminLogIn, getLocations,getProducts } = require("../utils");
const storeTable = require("../models/store");

// ----- Authentication for Admin -----
router.get("/login", adminLoggedIn, (req, res) => {
    res.render("admin/login");
});
router.post("/login", adminLogIn);

// ----------- APP ROUTES ---------------

router.get("/", adminCheck, async (req, res) => {
    res.render("admin/home", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
});

router.get("/store", adminCheck, async (req, res) => {
    const query = {verified : true};
    const stores = await storeTable.find(query);
    console.log(stores) ;
    const context = {
        "cities": ["indore", "IIT mandi","Chandigarh"],
        "stores": stores,
        "rejected":[
            {
                "name":"Aniket's Store",
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
