const Listing = require("../Models/listing.js");
const Review = require("../Models/review.js");
const ExpressError = require("../utils/ExpressError.js");

const multer  = require('multer')
const { cloudinary, storage } = require('../cloudConfig.js');
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error('Only JPG, JPEG, and PNG files are allowed!'), false); // reject
  }
};
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 },
});


module.exports.renderIndexOrSearchQuery = async (req, res) => {

  let search = req.query.search?.trim();
  let searchBy = req.query.searchBy?.trim();
  
  if(search){

    let allListing;

    if ((searchBy === "title") || (searchBy === "location")){
      allListing = await Listing.find({[searchBy] : { $regex: search, $options: "i" }});
    } else if (searchBy === "country") {
      allListing = await Listing.find({country : { $regex: `^${search}$`, $options: "i" }});
    } else {
      allListing = await Listing.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { country: { $regex: `^${search}$`, $options: "i" } }
        ]
      });
    }

    if(allListing.length === 0){
      req.flash("error", "No Listing found");
      return res.redirect("/listing");
    }

    return res.render("listing/index.ejs", { allListing });
  }
  
  let allListing = await Listing.find();
  return res.render("listing/index.ejs", { allListing });
};


module.exports.renderFilterResults = async (req, res) => {
  let { q } = req.query;
  let allListing = await Listing.find({category : q});
  if(allListing.length === 0){
    req.flash("error", `No Listing Available For ${q} Category`);
    return res.redirect("/listing");
  }
  res.render("listing/index.ejs", { allListing });
};


module.exports.renderNewListingForm = (req, res) => {
  res.render( "listing/new.ejs" );
};


module.exports.createListing = async (req, res) => {
  let { title, description, price, location, country, category, pincode } = req.body;
  let { path, filename } = req.file;

  let newListing =  new Listing({title, description, price, location, pincode, category, country});
  newListing.image = { path, filename };
  newListing.owner = req.user;

  try {
    const response = await fetch(`https://us1.locationiq.com/v1/search?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(location + "-" + pincode + ", " + country)}&format=json`);

    const data = await response.json();

    newListing.locationCoordinates = {
      type: "Point",
      coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)] // [longitude, latitude]
    };
  } catch (err) {
    console.error(err);
    return next(new ExpressError(500, "Unable to convert location into co-ordinates. Please enter Location in a said format"));
  }


  let listing = await newListing.save();
  req.flash("success", "Listing created sucessfully!");
  res.redirect('/listing');
}


module.exports.renderEditForm = async (req, res, next) => {
  let { listingId } = req.params;
  let listing = await Listing.findById(listingId);
  if(!listing){
    return next(new ExpressError(400, "Listing does not exists"));
  }
  res.render('listing/edit.ejs', { listing } );
};


module.exports.showListing = async (req, res, next) => {
  let { listingId } = req.params;
  let listing = await Listing.findById(listingId).populate({path: "reviews", populate: {path: "author", select: "username"}}).populate("owner");
  if(!listing){
    return next(new ExpressError(400, "Listing you requested for does not exists"));
  }
  res.render('listing/show.ejs', { listing } );
  
};


module.exports.updateListing = async (req, res, next) => {
  let { listingId } = req.params;
  let {title, description, price, location, country, category, pincode} = req.body;
  let updatedListing = await Listing.findByIdAndUpdate(listingId, ({title, description, price, location, category, country, pincode}), { runValidators: true, new: true});
  if(!updatedListing){
    return next(new ExpressError(400, "Listing does not exists"));
  }

  try {
    const response = await fetch(`https://us1.locationiq.com/v1/search?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(location + "-" + pincode + ", " + country)}&format=json`);

    const data = await response.json();

    updatedListing.locationCoordinates = {
      type: "Point",
      coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)] // [longitude, latitude]
    };
    await updatedListing.save();

  } catch (err) {
    console.error(err);
    return next(new ExpressError(500, "Unable to convert location into co-ordinates. Please enter Location in a said format"));
  }


  if(req.file){
    let delImageData = await cloudinary.uploader.destroy(updatedListing.image.filename);
    let { path, filename } = req.file;
    updatedListing.image = { path, filename };
    await updatedListing.save();
  }

  req.flash("success", "Listing updated sucessfully!");
  res.redirect(`/listing/${listingId}`)
};


module.exports.deleteListing = async (req, res, next) => {
  let { listingId } = req.params;
  let listing = await Listing.findByIdAndDelete(listingId);
  if(!listing){
    return next(new ExpressError(400, "Listing does not exists"));
  }

  
  // if we want to delete image files from Cloudinary when a listing is deleted, public_id is required to delete the file which gets While uploading the file to Cloudinary
  let delImageData = await cloudinary.uploader.destroy(listing.image.filename); // public_id is usually stored in 'filename' field
  // on successfull deletion -> { result: 'ok' } message will get printed on the console

  // Deleting all the reviews of listing
  if(listing.reviews.length){
    for(let reviewId of listing.reviews){
      let review = await Review.findByIdAndDelete(reviewId);
    }
  }

  req.flash("success", "Listing deleted sucessfully!");
  res.redirect('/listing');
};