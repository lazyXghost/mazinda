const express = require("express");
const port = process.env.PORT||8000;
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const localStrategy = require("passport-local").Strategy;
const MongoStore = require("connect-mongo");

const authRoutes = require("./routes/authroutes");
const adminRoutes = require("./routes/adminroutes");
const storeRoutes = require("./routes/storeroutes");

const {authCheck} = require("./middleware/auth");
const {login} = require("./utils")
const connectDB = require("./config/db");

// ------------- ENV FILE, DATABASE CONNECTION -----------
require("dotenv").config({ path: "./config/config.env" });
connectDB();

// ------- EXPRESS, BODYPARSER, EJS VIEW ENGINE SETUP --------
const app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.set("views", "./views");
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

// ----------- PASSPORT AND EXPRESS SESSION SETUP ------------
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

passport.use(new localStrategy ({usernameField:"email",passwordField:"password"},login));

passport.serializeUser( (userObj,done) => {
    done(null,userObj);
});

passport.deserializeUser( (userObj,done) => {
    done(null,userObj);
})

// --------------------  ROUTES SETUP -----------------------
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/store", storeRoutes);


app.get("/", (req, res) => {
    if (req.session.user == null) {
        user = {
            status: 0,
        };
        req.session.user = user;
    }

    res.render("index", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/profile", authCheck, async (req, res) => {
    const context = await allEventDetails(req);
    res.render("profile", {
        user: req.user,
        authenticated: req.isAuthenticated(),
        ...context,
    });
});

app.get("/error", (req, res) =>
    res.send("error logging in", {
        authenticated: req.isAuthenticated(),
        user: req.user,
    })
);

app.delete("/logout",(req,res) => {
    req.logOut();
    req.session.userr = null;
    res.redirect("/");
});

app.get("*", function (req, res) {
	res.status(404).send("<h1>404 NOT FOUND!</h1>");
});
   
//  -------------------- PORT SETUP -----------------------------
app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});