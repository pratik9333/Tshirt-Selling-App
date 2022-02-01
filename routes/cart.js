const router = require("express").Router();

const {
  addToCart,
  updateCart,
  getUserSpecificCartItems,
  removeCart,
} = require("../Controllers/cart");
const isLoggedIn = require("../middlewares/authenticate");

//crud operations in cart
router
  .route("/cart/:id")
  .post(isLoggedIn, addToCart)
  .put(isLoggedIn, updateCart)
  .delete(isLoggedIn, removeCart);

//get cart items
router.route("/cart").get(isLoggedIn, getUserSpecificCartItems);

module.exports = router;
