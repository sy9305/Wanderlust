const express = require("express");
const router = express.Router({mergeParams : true});
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


const wrapAsync = require("../utils/wrapAsync.js");
const { validateListing, isLoggedIn, isOwner } = require("../middlewares.js")
const listingController = require("../controller/listing.js");

router
    .route('/')
    .get( wrapAsync( listingController.renderIndexOrSearchQuery ))
    .post( isLoggedIn, upload.single('image'), validateListing, wrapAsync( listingController.createListing ))
;

router.get('/filter', wrapAsync( listingController.renderFilterResults ));


router.get('/new', isLoggedIn, listingController.renderNewListingForm );


router.get('/:listingId/edit', isLoggedIn, isOwner, wrapAsync( listingController.renderEditForm ));


router
    .route('/:listingId')
    .get( wrapAsync( listingController.showListing))
    .put( isLoggedIn, isOwner, upload.single("image"), validateListing, wrapAsync( listingController.updateListing ))
    .delete( isLoggedIn, isOwner, wrapAsync( listingController.deleteListing ))
;
module.exports = router;