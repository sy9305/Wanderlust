const Listing = require("./Models/listing.js");
const Review = require("./Models/review.js");
const User = require("./Models/user.js");
const { listingSchema, reviewSchema, userSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");


module.exports.validateListing = (req, res, next) => {
  console.log(req.body);
  let { title, description, location, country, price, category, pincode } = req.body;

  // If there's POST req and no uploaded file, reject early
  if ( (req.method === "POST") && !req.file ) {
    return next(new ExpressError(400, "Image is required"));
  }
  
  let listingData = {
    title,
    description,
    location,
    country,
    category,
    price: Number(price), // ensure it's a number
    pincode: Number(pincode)
  };
  
  if(req.file){
    let { path, filename } = req.file;
    listingData.image = { path, filename };
  }
  

  // Joi.fork() is used to modify existing schema fields conditionally — without rewriting the whole schema.
  // Take the "image" field in listingSchema and make it .required() — only in this specific case (e.g., for POST requests).

  let schema = (req.method === "POST") ? ( listingSchema.fork(["image"], field => field.required()) ) : ( listingSchema );

  // Joi has a .describe() method that prints the structure of the schema, including which fields are required.
  // console.dir(schema.describe(), { depth: null }); 

  
  let { error } = schema.validate(listingData);

  if (error) {
    console.log(listingData);
    return next(new ExpressError(400, error));
  }

  next();
};

module.exports.validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);

  if(result.error){
    return next(new ExpressError(400, result.error));
  }else {
    next();
  }
};

module.exports.validateUser = (req, res, next) => {
  let result = userSchema.validate(req.body);

  if(result.error){
    return next(new ExpressError(400, result.error));
  }else {
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }else {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in");
    res.redirect('/login');
  }
};


module.exports.isOwner = async (req, res, next) => {
  let {listingId} = req.params;
  let listing = await Listing.findById(listingId);


  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect(`/listing/${listingId}`);
  }

  // Use .equals() to compare ObjectIds
  if(listing.owner._id.equals(req.user._id)){
   return next();
  }

  req.flash("error", "You are not the Owner of the listing");
  return res.redirect(`/listing/${listingId}`);
};


module.exports.isAuthor = async (req, res, next) => {
  let {listingId, reviewId} = req.params;
  let review = await Review.findById(reviewId);


  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listing/${listingId}`);
  }

  // Use .equals() to compare ObjectIds
  if(review.author._id.equals(req.user._id)){
   return next();
  }

  req.flash("error", "You are not the Author of the review");
  return res.redirect(`/listing/${listingId}`);
};


module.exports.saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl && ( req.method === "GET" )){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};