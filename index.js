const express = require("express");
const port = 8000;
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { authCheck } = require("./middleware/auth");
const authRoutes = require("./routes/authroutes");
const connectDB = require("./config/db");
var url = require("url");

// const path = require("path");
// const mongoose = require("mongoose");
// const upload = require("./multer.js");
// const events = require("./models/Events.js");
// const paymentRoutes = require("./middleware/payment");

// const {
//     findEvent,
//     findEventFromId,
//     findUserTeam,
//     findUserTeamFromId,
//     createNewTeam,
//     joinTeam,
//     deleteTeam,
//     removeMember,
//     deleteOldInviteCode,
//     createNewInviteCode,
//     allEventDetails,
//     userDetails,
//     generateString
// } = require("./utils");

// const code = require("./models/code.js");
// const paymentDetail = require("./models/payment-detail");

// Load config
require("dotenv").config({ path: "./config/config.env" });

// Passport Config
// require("./config/passport")(passport);

// connect to Database
connectDB();

const app = express();

// Configure bodyParser
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// set template view engine
app.set("views", "./templates");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/static"));
app.use("/images", express.static(__dirname + "static/images"));

app.use(function (req, res, next) {
    if (!req.user) {
        res.header(
            "Cache-Control",
            "private, no-cache, no-store, must-revalidate"
        );
        res.header("Expires", "-1");
        res.header("Pragma", "no-cache");
    }
    next();
});

app.use("/mazinda.ico", express.static("../static/images/mazinda.ico"));
// Sessions middleware
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_DATABASE_URI }),
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
// app.use("/payment", authCheck, paymentRoutes);


app.get("/", (req, res) => {
    if (req.session.user == null) {
        user = {
            status: 0,
        };
        req.session.user = user;
    }

    // console.log(req.session.user)
    res.render("index", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

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

app.get("/profile", authCheck, async (req, res) => {
    const context = await allEventDetails(req);
    res.render("profile", {
        user: req.user,
        authenticated: req.isAuthenticated(),
        ...context,
    });
});

// app.get("/team", (req, res) => {
//     res.render("team", {
//         user: req.session.user,
//         authenticated: req.isAuthenticated(),
//     });
// });

// app.get("/events", async (req, res) => {
//     var eventTable = require("./models/Events");
//     const allEvents = await eventTable.find({}).lean();
//     res.render("events", {
//         events: allEvents,
//         authenticated: req.isAuthenticated(),
//         user: req.session.user,
//     });
// });

// app.get("/event", authCheck, async (req, res) => {
//     const event = await findEvent(req);
//     const team = await findUserTeam(req);

//     const context = {
//         event: event,
//         team: team,
//         authenticated: req.isAuthenticated(),
//     };
//     res.render("event", { ...context, user: req.session.user });
// });


app.get("/error", (req, res) =>
    res.send("error logging in", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    })
);

app.get("/adminlogin", (req, res) => {
    req.session.admin == "0";
    res.render("admin/adminlogin.ejs");
});

app.post("/adminauth", (req, res) => {
    if (
        req.body.email == process.env.ADMINEMAIL &&
        req.body.password == process.env.ADMINPASSWORD
    ) {
        req.session.admin = "1";
        res.render("admin/adminoption.ejs");
    } else {
        res.redirect("/adminlogin");
    }
});
                                            
app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
