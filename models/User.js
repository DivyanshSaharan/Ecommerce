const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
  },
  role: {
    type: String,
    default: "buyer",
  },
  gender: {
    type: String,
    trim: true,
    required: true,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  cart: [cartItemSchema]
});

userSchema.plugin(passportLocalMongoose);

let User = mongoose.model("User", userSchema);
module.exports = User;
