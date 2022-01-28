const Mongoose = require("mongoose");

const productSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    maxlength: [20, "Product name is too long"],
  },
  price: {
    type: String,
    required: [true, "Product price is required"],
    maxlength: [5, "Product price is too long"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    maxlength: [80, "Product description is too long"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "please select category from- short-sleeves, long-sleeves, sweat-shirts, hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
      message:
        "please select category ONLY from - short-sleeves, long-sleeves, sweat-shirts and hoodies ",
    },
  },
  brand: {
    type: String,
    required: [true, "please add a brand for clothing"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  noofreviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: Mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: Mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Mongoose.model("Product", productSchema);
