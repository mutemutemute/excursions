const { body } = require("express-validator");
const argon2 = require("argon2");
const { getUserByEmail } = require("../models/userModel");

const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (value, { req }) => {
      const existingUser = await getUserByEmail(req.body.email);
      if (existingUser) {
        const match = await argon2.verify(existingUser.password, value);
        if (!match) {
          throw new Error("Password is incorrect");
        }

        return true;
      } else {
        throw new Error("User with this email does not exist");
      }
    }),
];

module.exports = validateLogin;