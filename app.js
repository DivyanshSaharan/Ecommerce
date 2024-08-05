const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const seedDB = require("./seed");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/review");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const productApi = require("./routes/api/productapi"); //api
const passport = require("passport"); //pass
const LocalStrategy = require("passport-local"); //pass
const User = require("./models/User"); //pass
const dotenv=require('dotenv').config() //path in config we stored in some other address


mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// now for public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// seeding dummy data
// seedDB();

let configSession = {
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(configSession));
app.use(flash());

// use static serialize and deserialize of model for passport session support
app.use(passport.initialize()); //Sets up password to handle auth requests
app.use(passport.session()); //intializes session support for auth

// use static authenticate method of model in LocalStrategy(They are directly applied to the model)
passport.serializeUser(User.serializeUser()); // provided by passport-local-mongoose
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate())); 

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

// Routes
app.use(productRoutes);
app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(productApi);

// const port = 8080;
app.listen(process.env.PORT, () => {
  console.log(`server connected at port : ${process.env.PORT}`);
});