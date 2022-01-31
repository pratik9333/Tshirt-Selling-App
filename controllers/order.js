const Order = require("../models/order");
const Product = require("../models/product");

exports.createOrder = async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;
  try {
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getOneOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(400).json({ error: "No order found with given id" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getLoggedInOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    if (!orders) {
      return res
        .status(200)
        .json({ message: "No orders found with this user" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.admingetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders) {
      return res.status(200).json({ message: "No orders found" });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.adminUpdateOneOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(400)
        .json({ error: "No order was found with specified id" });
    }
    if (order.orderStatus === "delivered") {
      return res.status(400).json({ error: "Order was already delivered" });
    }

    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async (prod) => {
      await updateProductStock(prod.product, prod.quantity);
    });

    await order.save();
    res.status(200).json({ success: true, message: "Order was updated" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.adminDeleteOneOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(400)
        .json({ error: "No order was found with specified id" });
    }

    await order.remove();

    res
      .status(200)
      .json({ success: true, message: "Order was deleted successfully" });
  } catch (error) {}
};

const updateProductStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
};
