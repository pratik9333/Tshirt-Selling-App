const router = require("express").Router();

const {
  createOrder,
  adminDeleteOneOrder,
  admingetAllOrders,
  adminUpdateOneOrder,
  getLoggedInOrders,
  getOneOrder,
} = require("../Controllers/order");

// ********* Admin only routes *********

//admin crud operations -> Order
router
  .route("/admin/order/:id")
  .delete(authenticate, checkAdmin, adminDeleteOneOrder)
  .get(authenticate, checkAdmin, admingetAllOrders)
  .put(authenticate, checkAdmin, adminUpdateOneOrder);

// ********* User only routes *********

//create order
router.route("/order/create").post(authenticate, createOrder);

//get user specific orders
router.route("/orders").get(authenticate, getLoggedInOrders);

//get one order
router.route("/order/:id").get(authenticate, getOneOrder);

module.exports = router;
