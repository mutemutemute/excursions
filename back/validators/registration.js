const { body } = require("express-validator");
const {
  getExcursionByIdModel,
  getExcursionDateById,
} = require("../models/excursionModel");

const validateRegistration = [
  body("excursion_id")
    .trim()
    .notEmpty()
    .withMessage("Excursion ID is required")
    .isInt({ gt: 0 })
    .withMessage("Excursion ID must be a positive number")
    .bail()
    .custom(async (value) => {
      const excursion = await getExcursionByIdModel(value);
      if (!excursion) {
        throw new Error("Excursion with this ID does not exist");
      }
      return true;
    }),

  body("excursion_date_id")
    .trim()
    .notEmpty()
    .withMessage("Excursion Date ID is required")
    .isInt({ gt: 0 })
    .withMessage("Excursion Date ID must be a positive number")
    .bail()
    .custom(async (value, { req }) => {
      const excursionDate = await getExcursionDateById(value);
      if (!excursionDate) {
        throw new Error("Excursion Date with this ID does not exist");
      }

      if (excursionDate.excursion_id !== parseInt(req.body.excursion_id)) {
        throw new Error(
          "This Excursion Date does not belong to the selected Excursion"
        );
      }

      return true;
    }),
];

module.exports = validateRegistration;
