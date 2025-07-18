const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    mobile: {
        type: Number,
        required: true,
        unique: true
    },

    state: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: true,
    },

    pincode: {
        type: Number,
        required: true,
    },

    registeredAt: {
        type: Date,
        default: Date.now(),
    }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;