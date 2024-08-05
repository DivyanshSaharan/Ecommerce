const express = require("express");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

router.get("/register", (req, res) => {
  res.render("auth/signup");
});

router.post("/register", async (req, res) => {
  const { username, password, email, role, gender } = req.body;
  const user = new User({ username, email, gender, role });

  try {
      const newUser = await User.register(user, password); //creating new user in database using passport( match: username)
      req.flash("success", "Registration successful! You can now log in.");
      res.redirect("/login");
  } catch (err) {
      req.flash("error", "User already exists. Please choose a different username.");
      res.redirect("/register");
  }
});


router.get("/login", (req, res) => {
  res.render("auth/login");
});

//Authentication of user
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  function (req, res) {
    // console.log(req.user , "User");
    req.flash("success", `Welcome Back ${req.user.username}`);
    res.redirect("/products");
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out successfully");
    res.redirect("/login");
  });
});

module.exports = router;