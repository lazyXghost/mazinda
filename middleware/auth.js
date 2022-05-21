const storeTable = require("../models/store")

module.exports = {
  authCheck: function (req, res, next) {
    if (!req.user) {
      res.redirect("/auth/login");
    }
    return next();
  },

  userCheck: function (req, res, next) {
    if (!req.user || req.user.status != 'user') {
      return res.redirect("/auth/login");
    }
    return next();
  },
  storeCheck: function (req, res, next) {
    if (!req.user || req.user.status != 'store') {
      return res.redirect("/store/login");
    }
    return next();
  },
  adminCheck: function (req, res, next) {
    if (!req.user || req.user.status != 'admin') {
      return res.redirect("/admin/login");
    }
    return next();
  },

  userLoggedIn:(req,res,next) => {
    if(req.user && req.user.status == 'user') {
      return res.redirect("/store/dashboard");
    }
    next();
  },
  storeLoggedIn: function(req,res,next){
    if(req.user && req.user.status == 'store') {
      return res.redirect("/store/dashboard");
    }
    return next();
  },
  adminLoggedIn:(req,res,next) => {
    if(req.user && req.user.status == 'admin') {
      return res.redirect("/admin/dashboard");
    }
    return next();
  },
};
