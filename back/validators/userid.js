const { param } = require("express-validator");
const { getUserWithRegistrations } = require("../models/excursionModel");

const validateUserId = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Id must be a positive integer")
    .bail()
    .custom(async (value) => {
      const user = await getUserWithRegistrations(value);
      if (!user) {
        throw new Error("User with this id does not have registrations");
      }
      return true;
    }),
];

module.exports = validateUserId;
