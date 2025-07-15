const express = require("express");
const router = express.Router({mergeParams : true});

const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isAuthor } = require("../middlewares.js")
const reviewController = require("../controller/review.js");



router.post('/', isLoggedIn, validateReview, wrapAsync( reviewController.createReview ));


router.delete('/:reviewId', isLoggedIn, isAuthor, wrapAsync( reviewController.deleteReview ));


module.exports = router;