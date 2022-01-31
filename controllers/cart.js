const Cart = require("../models/cart");
const Product = require("../models/product");

exports.addToCart = async (req, res) => {
  const { product, description, price } = req.body;
  try {
    if (!product || !description || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }
    await Cart.create({ product, description, price, user: req.user._id });

    res.status(200).json({ success: true, message: "Added to cart" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.updateQuantityInCart = async (req, res) => {
  try {
    if (!req.body.quantity) {
      return res.status(400).json({ error: "Quantity field is required" });
    }
    const cart = await Cart.findById(req.parsms.id);

    if (!cart) {
      return res.status(400).json({ error: "Product was not found in cart" });
    }
  } catch (error) {}
};
