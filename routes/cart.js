const router = require("express").Router();

const {
  addToCart,
  updateCart,
  getUserSpecificCartItems,
} = require("../Controllers/cart");
const isLoggedIn = require("../middlewares/authenticate");

//crud operations in cart
router
  .route("/cart/:id")
  .post(isLoggedIn, addToCart)
  .put(isLoggedIn, updateCart);

//get cart items
router.route("/cart").get(isLoggedIn, getUserSpecificCartItems);

module.exports = router;
