const { param } = require("express-validator");
const { getRegistrationById } = require("../models/excursionModel");

const validateRegistrationId = [
  param("registrationId")
    .isInt({ gt: 0 })
    .withMessage("Id must be a positive integer")
    .bail()
    .custom(async (value) => {
      const registration = await getRegistrationById(value);
      if (!registration) {
        throw new Error("Registration with this id does not exist");
      }
      return true;
    }),
];

module.exports = validateRegistrationId;
