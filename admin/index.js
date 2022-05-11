const express = require("express");
const port = process.env.PORT || 3000;
const app=express()

// set template view engine
app.set("view engine", "ejs");
app.set("views", "./routes");

app.use(express.static(__dirname+'/public'))

app.get("/admin", (req, res) => {
    res.render("admin/home");
});

app.get("/admin/store", (req, res) => {
    res.render("admin/store");
});

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
