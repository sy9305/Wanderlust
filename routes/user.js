const express = require("express");
const router = express.Router({mergeParams : true});
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");

const { validateUser, saveRedirectUrl } = require("../middlewares.js")
const userController = require("../controller/user.js");

router
    .route('/register')
    .get( userController.renderRegistrationForm )
    .post( validateUser, wrapAsync ( userController.registerUser))
;


router
    .route('/login')
    .get( userController.renderLoginForm)
    .post( saveRedirectUrl, passport.authenticate("local", {
        failureRedirect:"/login",
        failureFlash: true,
      }), wrapAsync ( userController.login )
    )
;


router.get('/logout', userController.logout);


module.exports = router;