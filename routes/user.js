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

const authenticate = require("../middlewares/authenticate");
const { checkAdmin, checkManager } = require("../middlewares/checkRole");

/* ***** User only Routes ***** */

//signup route
router.route("/signup").post(signup);

//login route
router.route("/login").post(login);

//logout route
router.route("/logout").get(logout);

//logged in user details
router.route("/user").get(authenticate, getLoggedInUserDetails);

//update user
router.route("/user").put(authenticate, updateUserDetails);

//forgotPassword route
router.route("/forgot/password").post(authenticate, forgotPassword);

//verifyForgotPasswordToken
router
  .route("/password/reset/:token")
  .post(authenticate, verifyForgotPasswordToken);

//change password
router.route("/update/password").post(authenticate, changePassword);

/* ***** Admin only Routes ***** */

//get users
router.route("/users").get(authenticate, checkAdmin, getUsers);

//user read,update,delete by admin
router
  .route("/user/:id")
  .get(authenticate, checkAdmin, getOneUser)
  .put(authenticate, checkAdmin, adminUpdateOneUser)
  .delete(authenticate, checkAdmin, adminDeleteOneUser);

/* ***** Manager only Routes ***** */

//get users
router
  .route("/manager/users")
  .get(authenticate, checkManager, getUsersForManager);

module.exports = router;
