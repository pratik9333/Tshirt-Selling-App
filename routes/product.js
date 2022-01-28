const router = require("express").Router();

const {
  addProduct,
  getProducts,
  getProduct,
  adminDeleteProduct,
  adminUpdateProduct,
  adminGetAllProducts,
  addReview,
  deleteReview,
  getReviewsForOneProduct,
} = require("../controllers/product");

const authenticate = require("../middlewares/authenticate");
const { checkAdmin } = require("../middlewares/checkRole");

// ********* Admin only routes *********

//admin crud operations -> Product
router
  .route("/admin/product")
  .post(authenticate, checkAdmin, addProduct)
  .get(authenticate, checkAdmin, adminGetAllProducts)
  .put(authenticate, checkAdmin, adminUpdateProduct)
  .delete(authenticate, checkAdmin, adminDeleteProduct);

// ********* User only routes *********

//get products
router.route("/products").get(authenticate, getProducts);

//get product
router.route("/product/:id").get(authenticate, getProduct);

//add review
router.route("/review/:id").put(authenticate, addReview);
router.route("/review/:id").delete(authenticate, deleteReview);
router.route("/review/:id").get(getReviewsForOneProduct);

module.exports = router;
