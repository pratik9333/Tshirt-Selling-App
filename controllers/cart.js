const Cart = require("../models/cart");
const Product = require("../models/product");

exports.addToCart = async (req, res) => {
  try {
    const userCartProducts = await Cart.find({ user: req.user._id });

    if (userCartProducts.length != 0) {
      for (let item of userCartProducts) {
        if (item.product.toString() === req.params.id) {
          return res.status(400).json({ error: "Product is already in cart" });
        }
      }
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(400)
        .json({ error: "No product found with the given id" });
    }

    let total = product.price;
    let price = total;

    await Cart.create({
      product: req.params.id,
      total,
      price,
      user: req.user._id,
    });

    res.status(200).json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.updateCart = async (req, res) => {
  const { quantity } = req.body;
  let count = 0;
  try {
    if (!quantity) {
      return res.status(400).json({ error: "Quantity field is required" });
    }

    const cartProduct = await Cart.findById(req.params.id);

    if (!cartProduct) {
      return res.status(400).json({ error: "Product was not found in cart" });
    }

    let updatedTotal = cartProduct.price * quantity;

    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        quantity,
        total: updatedTotal,
      },
      { new: true }
    ).populate("product", "name description photos");

    updatedCart.product.photos.forEach((photo) => {
      if (count == 0) {
        updatedCart.product.photos = photo;
      }
      count++;
    });

    count = 0;

    updatedCart.user = undefined;
    updatedCart.__v = undefined;

    return res.status(200).json({ success: true, updatedCart });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getUserSpecificCartItems = async (req, res) => {
  try {
    let count = 0;
    const cartItems = await Cart.find({ user: req.user._id }).populate(
      "product",
      "name description photos"
    );

    if (cartItems.length == 0) {
      return res.status(200).json({ message: "Cart is empty" });
    }

    cartItems.forEach((item) => {
      item.user = undefined;
      item.__v = undefined;
      item.product.photos.forEach((photo) => {
        if (count == 0) {
          item.product.photos = photo;
        }
        count++;
      });
      count = 0;
    });

    count = 0;

    return res.status(200).json({ success: true, cartItems });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.removeCart = async (req, res) => {
  try {
    const removeCart = await Cart.findByIdAndDelete(req.params.id, {
      new: true,
    });
    if (!removeCart) {
      return res.status(400).json({ error: "Product was not found in cart" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Product removed from cart" });
  } catch (error) {}
};
