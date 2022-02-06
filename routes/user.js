const router = require("express").Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  verifyForgotPasswordToken,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  getUsers,
  getOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
  getUsersForManager,
} = require("../controllers/user");

const isLoggedIn = require("../middlewares/authenticate");
const { checkAdmin, checkManager } = require("../middlewares/checkRole");

/* ***** User only Routes ***** */

//signup route
router.route("/signup").post(signup);

//login route
router.route("/login").post(login);

//logout route
router.route("/logout").get(logout);

//logged in user details
router.route("/user").get(isLoggedIn, getLoggedInUserDetails);

//update user
router.route("/user").put(isLoggedIn, updateUserDetails);

//forgotPassword route
router.route("/forgot/password").post(isLoggedIn, forgotPassword);

//verifyForgotPasswordToken
router
  .route("/password/reset/:token")
  .post(isLoggedIn, verifyForgotPasswordToken);

//change password
router.route("/update/password").post(isLoggedIn, changePassword);

/* ***** Admin only Routes ***** */

//get users
router.route("/users").get(isLoggedIn, checkAdmin, getUsers);

//user read,update,delete by admin
router
  .route("/user/:id")
  .get(isLoggedIn, checkAdmin, getOneUser)
  .put(isLoggedIn, checkAdmin, adminUpdateOneUser)
  .delete(isLoggedIn, checkAdmin, adminDeleteOneUser);

/* ***** Manager only Routes ***** */

//get users
router
  .route("/manager/users")
  .get(isLoggedIn, checkManager, getUsersForManager);

module.exports = router;
