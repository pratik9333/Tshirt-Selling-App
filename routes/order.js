const router = require("express").Router();

const {
  createOrder,
  adminDeleteOneOrder,
  admingetAllOrders,
  adminUpdateOneOrder,
  getLoggedInOrders,
  getOneOrder,
} = require("../Controllers/order");
const isLoggedIn = require("../middlewares/authenticate");
const { checkAdmin } = require("../middlewares/checkRole");

// ********* Admin only routes *********

//admin crud operations -> Order
router
  .route("/admin/order/:id")
  .delete(isLoggedIn, checkAdmin, adminDeleteOneOrder)
  .get(isLoggedIn, checkAdmin, admingetAllOrders)
  .put(isLoggedIn, checkAdmin, adminUpdateOneOrder);

// ********* User only routes *********

//create order
router.route("/order").post(isLoggedIn, createOrder);

//get user specific orders
router.route("/order").get(isLoggedIn, getLoggedInOrders);

//get one order
router.route("/order/:id").get(isLoggedIn, getOneOrder);

module.exports = router;
