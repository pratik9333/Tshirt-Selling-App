var express = require("express");
var router = express.Router();

const { razorpay, successrazorpay } = require("../controllers/payment");
const { isLoggedIn } = require("../middlewares/authenticate");

router.post("/payment", isLoggedIn, razorpay);
router.post("/payment/success/", successrazorpay);

module.exports = router;
