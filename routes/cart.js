const express = require("express");
const { isLoggedIn } = require("../middleware");
const User = require("../models/User");
const Product = require("../models/product");
const router = express.Router();
const stripe = require('stripe')('sk_test_51OcmQxSFDu1ZCDJRMHu4qcnsgSSJDHOb5rwkq0ZGXzLbVSJNsQkAv8pGYXeBJFSQtJUetLtm8s1SrodzbhqGXqj300O8m1nMoW');

router.get("/user/cart", isLoggedIn, async (req, res) => {
  let userId = req.user._id;
  let user = await User.findById(userId).populate("cart");
  let totalAmount = user.cart.reduce((sum, curr) => sum + curr.price, 0);
  //   console.log(totalAmount);

  res.render("cart/cart", { user, totalAmount });
});

//payment
router.get('/checkout/:id', async (req, res) => {
  let userId = req.params.id;
  let user = await User.findById(userId).populate("cart");
  let totalAmount = user.cart.reduce((sum, curr) => sum + curr.price, 0);
  //   console.log(totalAmount);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: totalAmount*100,
        },
        quantity: user.cart.length,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:4242/success',
    cancel_url: 'http://localhost:4242/cancel',
  });

  res.redirect(303, session.url);
});

router.post("/user/:productId/add", isLoggedIn, async (req, res) => {
  let { productId } = req.params;
  let userId = req.user._id;
  let user = await User.findById(userId);
  let product = await Product.findById(productId);
  user.cart.push(product);
  await user.save();
  res.redirect("/user/cart");
});

module.exports = router;