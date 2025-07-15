const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description:  Joi.string().required(),
    location:  Joi.string().required(),
    country:  Joi.string().required(),
    price:  Joi.number().required().min(0),
    category: Joi.string().valid('Trending', 'Rooms', 'Beaches', 'Pools', 'Castles', 'Cities', 'Arctic', 'Camping', 'Farms', 'Mountains', 'Others').required(),
    pincode:  Joi.number().required().min(100000),
    image:  Joi.object({
        path: Joi.string().required(),
        filename: Joi.string().required()
    }),
});

module.exports.reviewSchema = Joi.object({
    comment:  Joi.string().required(),
    rating:  Joi.number().required().min(0).max(5),
});

module.exports.userSchema = Joi.object({
    firstName:  Joi.string().required(),
    lastName:  Joi.string().required(),
    email: Joi.string().email().required(),
    mobile:  Joi.number().required(),
    state:  Joi.string().required(),
    country:  Joi.string().required(),
    pincode:  Joi.number().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().label('Confirm password')
  .messages({ 'any.only': 'Passwords do not match' }),
});


// Joi.any()	Accepts any type — we will constrain it below.
// .valid(Joi.ref('password'))	Must be equal to the value of password. (Joi.ref creates a reference)
// .required()	Field is mandatory.
// .label('Confirm password')	Sets a custom label for error messages.
// .messages({ 'any.only': ... })	Custom error message if the value doesn’t match password.