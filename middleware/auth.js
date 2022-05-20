const shopTable = require("../models/shop")

module.exports = {
  authCheck: function (req, res, next) {
    if (!req.user) {
      res.redirect("/auth/login");
    } else {
      req.session.user = req.user;
      return next();
    }
  },

  userLoggedIn:(req,res,next) => {
    if(req.user) {
        req.session.user = req.user;
        return res.redirect("/store/dashboard");
    }
    next();
  },

  shopCheck: function (req, res, next) {
    console.log("Shop check ka chutiyapa");
    console.log(req.user);
    console.log(req.session);
    if (!req.user) {
      res.redirect("/store/login");
    } else {
      req.session.user = req.user;
      return next();
    }
  },

  shopLoggedIn: function(req,res,next){
    if(req.user) {
        req.session.user = req.user;
        return res.redirect("/store/dashboard");
    }
    return next();
  },

  adminCheck: function (req, res, next) {
    return next();
    if (!req.user) {
      res.redirect("/admin/login");
    } else {
      req.session.user = req.user;
      return next();
    }
  },

  adminLoggedIn:(req,res,next) => {
    if(req.user) {
        console.log(req.user);
        req.session.user = req.user;
        return res.redirect("/admin/home");
    }
    next();
  },
};
