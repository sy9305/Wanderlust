const passport = require("passport");
const User = require("../Models/user.js");
const ExpressError = require("../utils/ExpressError.js");



module.exports.renderRegistrationForm = (req, res) => {
  res.render("user/register.ejs");
};


module.exports.registerUser = async (req, res, next) => {

  let { firstName, lastName, email, mobile, state, country, pincode, username, password } = req.body;

  let edata = await User.findOne({email});
  if(edata){
    return next(new ExpressError(400, "Email already registered"));
  }

  let mdata = await User.findOne({mobile});
  if(mdata){
    return next(new ExpressError(400, "Mobile no. already registered"));
  }

  let user = new User({ firstName, lastName, email, mobile, state, country, pincode, username });

  let registerUser = await User.register(user, password)

  req.flash("success", "User Registered Sucessfully");
  res.redirect('/login')
};


module.exports.renderLoginForm = (req, res) => {
  res.render("user/login.ejs");
};


module.exports.login = async (req, res) => {
    let redirectUrl = res.locals.redirectUrl || "/listing";
    req.flash("success", "Welcome back to Wanderlust!");
    res.redirect(redirectUrl);
};


module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if(err){
      next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect('/listing')
  });
};
