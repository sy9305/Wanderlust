const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");
const { required } = require('joi');

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    path: String,
    filename: String
  },

  price: {
    type: Number,
    min: [0, "Enter a valid Price"],
    required: true,
  },

  category: {
    type: String,
    enum: ["Trending", "Rooms", "Beaches", "Pools", "Castles", "Cities", "Arctic", "Camping", "Farms", "Mountains", "Others"],
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  pincode: {
    type: Number,
    min: [100000, "Enter a valid Pincode"],
    required: true,
  },

  locationCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },

    coordinates: {
      type: [Number],
      required: true
    }
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    }
  ]

});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;