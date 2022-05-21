const express = require("express");
const port = process.env.PORT||8000;
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const userRoutes = require("./routes/userroutes");
const adminRoutes = require("./routes/adminroutes");
const storeRoutes = require("./routes/storeroutes");

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
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// --------------------  ROUTES SETUP -----------------------
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/store", storeRoutes);

app.get("*", function (req, res) {
	res.status(404).send("<h1>404 NOT FOUND!</h1>");
});

//  -------------------- PORT SETUP -----------------------------
app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
