const { body } = require("express-validator");
const { getExcursionById } = require("../models/excursionModel");
const validateReview = [
  body("excursion_id")
    .trim()
    .notEmpty()
    .withMessage("Excursion ID is required")
    .isInt()
    .withMessage("Excursion ID must be a number")
    .custom(async (value) => {
      const excursion = await getExcursionById(value);
      if (!excursion) {
        throw new Error("Excursion with this ID does not exist");
      }
    }),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  body("rating")
    .trim()
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),

  body("comment")
    .trim()
    .optional()
    .isString()
    .withMessage("Comment must be a string"),
];

module.exports = validateReview;
