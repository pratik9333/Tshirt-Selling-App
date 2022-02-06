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

    await client.del(`user:${req.user._id.toString()}`);

    return res.status(200).json({ success: "Added to cart" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.updateCart = async (req, res) => {
  const { incr, decr } = req.body;

  try {
    const cartItem = await Cart.findById(req.params.id);

    if (incr) {
      cartItem.quantity += 1;
      cartItem.total = cartItem.price * cartItem.quantity;
    }
    if (decr) {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        cartItem.total = cartItem.total - cartItem.price;
      } else {
        return res
          .status(200)
          .json({ success: false, message: "Quantity cannot be decreased" });
      }
    }

    await client.del(`user:${req.user._id.toString()}`);

    cartItem.save();

    return res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getUserSpecificCartItems = async (req, res) => {
  try {
    client.hgetall(`user:${req.user._id.toString()}`, async (err, obj) => {
      if (!obj) {
        const cartItems = await Cart.find({ user: req.user._id });
        if (cartItems.length !== 0) {
          await client.hmset(
            `user:${req.user._id.toString()}`,
            "cartItems",
            JSON.stringify(cartItems)
          );
          return res.status(200).json({ cartItems });
        } else {
          return res.status(200).json({ message: "Cart is empty" });
        }
      } else {
        client.hgetall(`user:${req.user._id.toString()}`, (err, obj) => {
          return res.status(200).json(JSON.parse(obj.cartItems));
        });
      }
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.removeCart = async (req, res) => {
  try {
    const findProduct = await Cart.find({ product: req.params.id });

    if (!findProduct) {
      return res.status(400).json({ error: "Product was not found in cart" });
    }

    await Cart.deleteOne({ product: req.params.id });

    await client.del(`user:${req.user._id.toString()}`);

    // client.hgetall(`user:${req.user._id.toString()}`, async (err, obj) => {
    //   let items = JSON.parse(obj.cartItems);
    //   let filteredItems = items.filter(
    //     (item) => item.product !== req.params.id
    //   );
    //   await client.hmset(
    //     `user:${req.user._id.toString()}`,
    //     "cartItems",
    //     JSON.stringify(filteredItems)
    //   );
    // });
    return res
      .status(200)
      .json({ success: true, message: "Product removed from cart" });
  } catch (error) {}
};
