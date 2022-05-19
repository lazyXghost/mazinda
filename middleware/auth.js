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
    if (!req.user) {
      res.redirect("/store/login");
    } else {
      req.session.user = req.user;
      return next();
    }
  },

  shopLoggedIn:(req,res,next) => {
    if(req.user) {
        req.session.user = req.user;
        return res.redirect("/store/dashboard");
    }
    next();
  },

  adminCheck: function (req, res, next) {
    if (!req.user) {
      res.redirect("/admin/login");
    } else {
      req.session.user = req.user;
      return next();
    }
  },

  adminLoggedIn:(req,res,next) => {
    if(req.user) {
        req.session.user = req.user;
        return res.redirect("/admin/dashboard");
    }
    next();
  },
};
