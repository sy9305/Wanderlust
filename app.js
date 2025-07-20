if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./Models/listing.js");
const User = require("./Models/user.js");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const moment = require('moment');


const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");


const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');


app.use(cookieParser(process.env.SECRET));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


const dbUrl = process.env.ATLAS_DB_URL;



const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 3600
});

store.on("error", () => {
  console.log(`Error occured in Mongo Session Store ${err}`);
});

const sessionOptions ={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// const mongoDbUrl =  "mongodb://127.0.0.1:27017/Wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.moment = moment;
  next();
});


app.get('/', async (req, res) => {
  let allListing = await Listing.find();
  res.render("listing/index.ejs", { allListing });
});


// register route
app.use("/", userRoute);


// listing routes
app.use("/listing", listingRoute);


// Review routes
app.use("/listing/:listingId/review", reviewRoute);



// error route
app.use((err, req, res, next) => {
  let {statusCode = 500, message="Something went wrong"} = err;
  console.log(err);
  res.status(statusCode).render('error.ejs',{ message });
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
