const { body } = require("express-validator");
const validStatuses = ["Pending", "Confirmed", "Canceled", "Closed"];
const { getExcursionDateById } = require("../models/excursionModel");

const validateUpdateRegistration = [
  body("status")
    .trim()
    .optional()
    .isString()
    .withMessage("Status must be a string")
    .isIn(validStatuses)
    .withMessage(`Status must be one of ${validStatuses}`),

  body("excursion_date_id")
    .trim()
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Excursion Date ID must be a positive number")
    .bail()
    .custom(async (value, { req }) => {
      const excursionDate = await getExcursionDateById(value);

      if (!excursionDate) {
        throw new Error("Excursion Date with this ID does not exist");
      }

      const dataBaseExcursionId = excursionDate.excursion_id;

      req.body.excursion_id = dataBaseExcursionId;

      return true;
    }),
];

module.exports = validateUpdateRegistration;
