const router = require("express").Router();

const {
  addToCart,
  updateCart,
  getUserSpecificCartItems,
  removeCart,
  removeAllUserItem,
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

//delete all user items
router.route("/cart").delete(isLoggedIn, removeAllUserItem);

module.exports = router;
