const express = require("express");
const {
  signup,
  login,
  logout,
  protect,
  getAuthenticatedUser,
} = require("../controllers/authController");
const validateNewUser = require("../validators/signup");
const validate = require("../validators/validate");
const validateLogin = require("../validators/login");

const router = express.Router();

router.route("/signup").post(validateNewUser, validate, signup);
router.route("/login").post(validateLogin, validate, login);
router.route("/logout").get(protect, logout);
router.route("/me").get(protect, getAuthenticatedUser);

module.exports = router;
