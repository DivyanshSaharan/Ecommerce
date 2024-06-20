const express = require("express");
const { isLoggedIn } = require("../middleware");
const User = require("../models/User");
const Product = require("../models/product");
const router = express.Router();
const stripe = require('stripe')('sk_test_51OcmQxSFDu1ZCDJRMHu4qcnsgSSJDHOb5rwkq0ZGXzLbVSJNsQkAv8pGYXeBJFSQtJUetLtm8s1SrodzbhqGXqj300O8m1nMoW');

router.get("/user/cart", isLoggedIn, async (req, res) => {
  let userId = req.user._id;
  let user = await User.findById(userId).populate("cart.product");
  let totalAmount = user.cart.reduce((sum, curr) => sum + curr.product.price * curr.quantity, 0);
  res.render("cart/cart", { user, totalAmount });
});

router.get("/user/cart/totalAmount", isLoggedIn, async (req, res) => {
  const userId = req.user._id;

  try {
    let user = await User.findById(userId).populate('cart.product');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let totalAmount = user.cart.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    // Update the user object with the new total amount
    user.totalAmount = totalAmount;
    await user.save();

    res.status(200).json({ success: true, totalAmount });
  } catch (err) {
    console.error("Error calculating total amount:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Payment
router.get('/checkout/:id', async (req, res) => {
  let userId = req.params.id;
  let user = await User.findById(userId).populate("cart.product");
  
  // Ensure user.cart is populated correctly with product details and updated quantities
  const session = await stripe.checkout.sessions.create({
    line_items: user.cart.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product.name,
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity, // Ensure correct quantity is passed
    })),
    mode: 'payment',
    success_url: `http://${req.headers.host}/success`,
    cancel_url: `http://${req.headers.host}/cancel`,
  });

  res.redirect(303, session.url);
});

router.get('/cancel', isLoggedIn, async (req, res) => {
  res.redirect('/user/cart');
});

router.get('/success', isLoggedIn, async (req, res) => {
  req.flash("success", "Payment Successful");
  let userId = req.user._id;
  let user = await User.findById(userId);
  user.cart = [];
  await user.save();
  res.redirect('/user');
});

router.post("/user/:productId/add", isLoggedIn, async (req, res) => {
  let { productId } = req.params;
  let userId = req.user._id;
  let user = await User.findById(userId);
  let product = await Product.findById(productId);
  const existingItem = user.cart.find(item => item.product.equals(productId));
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cart.push({ product, quantity: 1 });
  }
  await user.save();
  res.redirect("/user/cart");
});

router.post("/user/:productId/increment", isLoggedIn, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  
  try {
    let user = await User.findById(userId);
    let cartItem = user.cart.find(item => item.product.equals(productId));
    
    if (cartItem) {
      cartItem.quantity += 1;
      await user.save();
      res.status(200).json({ success: true, quantity: cartItem.quantity });
    } else {
      res.status(404).json({ success: false, message: "Item not found in cart" });
    }
  } catch (err) {
    console.error("Error incrementing quantity:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/user/:productId/decrement", isLoggedIn, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  
  try {
    let user = await User.findById(userId);
    let cartItem = user.cart.find(item => item.product.equals(productId));
    
    if (cartItem) {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        await user.save();
        res.status(200).json({ success: true, quantity: cartItem.quantity });
      } else {
        res.status(400).json({ success: false, message: "Quantity cannot be less than 1" });
      }
    } else {
      res.status(404).json({ success: false, message: "Item not found in cart" });
    }
  } catch (err) {
    console.error("Error decrementing quantity:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


router.delete('/user/:productId', isLoggedIn, async (req, res) => {
  let { productId } = req.params;
  let userId = req.user._id;
  let user = await User.findById(userId);
  user.cart = user.cart.filter(item => !item.product.equals(productId));
  await user.save();
  req.flash('success', 'Product deleted successfully');
  res.redirect('/user/cart');
});

module.exports = router;
