const { param } = require("express-validator");
const { getExcursionByIdModel } = require("../models/excursionModel");

const validateExcursionId = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Id must be a positive integer")
    .bail()
    .custom(async (value) => {
      const appointment = await getExcursionByIdModel(value);
      if (!appointment) {
        throw new Error("Excursion with this id does not exist");
      }
      return true;
    }),
];

module.exports = validateExcursionId;
