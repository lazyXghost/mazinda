module.exports = {
  userCheck: function (req, res, next) {
    if(req.user && req.user.userType == 'user')
      return next();
    return res.redirect("/login");
  },
  storeCheck: function (req, res, next) {
    if(req.user && req.user.userType == 'store' && req.user.status == 'accepted')
      return next();
    return res.redirect("/store/login");
  },
  adminCheck: function (req, res, next) {
    if(req.user && req.user.userType == 'admin')
      return next();
    return res.redirect("/admin/login");
  },

  userLoggedIn:(req,res,next) => {
    if(req.user && req.user.userType == 'user') {
      return res.redirect("/");
    }
    next();
  },
  storeLoggedIn: function(req,res,next){
    if(req.user && req.user.userType == 'store' && req.user.approved == 'accepted') {
      return res.redirect("/store/");
    }
    return next();
  },
  adminLoggedIn:(req,res,next) => {
    if(req.user && req.user.userType == 'admin') {
      return res.redirect("/admin/");
    }
    return next();
  },
};
