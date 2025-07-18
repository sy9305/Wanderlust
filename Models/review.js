const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user.js");

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true,
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;