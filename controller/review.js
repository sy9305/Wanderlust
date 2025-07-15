const Listing = require("../Models/listing.js");
const Review = require("../Models/review.js");
const ExpressError = require("../utils/ExpressError.js");


module.exports.createReview = async (req, res, next) => {
  let { listingId } = req.params;

  let {comment, rating} = req.body;
  let newReview = new Review({comment, rating});
  newReview.author = req.user;

  let updatedListing = await Listing.findByIdAndUpdate(listingId, {$push: {reviews: newReview}}, { runValidators: true, new: true});
  if(!updatedListing){
    return next(new ExpressError(400, "Review cannot be added because corresponding listing cannot be found"));
  }

  // we can alo use below lines for doing above line task
  // let listing = await Listing.findById(listingId);
  // listing.reviews.push(newReview);
  // await listing.save();

  let savedReview = await newReview.save();
  // console.log(moment(savedReview.createdAt).isValid()); // should return true

  // console.log(moment.utc(savedReview.createdAt).local().format('YYYY-MM-DD HH:mm:ss'));
  req.flash("success", "Review added sucessfully!");
  res.redirect(`/listing/${listingId}`);
};


module.exports.deleteReview = async (req, res, next) => {
  let { listingId, reviewId } = req.params;

  // removing the reviewId from the array of listing
  let listing = await Listing.findByIdAndUpdate(listingId, {$pull: {reviews: reviewId}}, { runValidators: true, new: true} );
  if(!listing){
    return next(new ExpressError(400, "Review cannot be added because corresponding listing cannot be found"));
  }

  // Deleting the review
  let review = await Review.findByIdAndDelete(reviewId);
  if(!review){
    return next(new ExpressError(400, "Review does not exists"));
  }

  req.flash("success", "Review deleted sucessfully!");
  res.redirect(`/listing/${listingId}`);
};