const mongoose = require("mongoose");

const cartSchema = new Mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectID,
    ref: "Product",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectID,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
