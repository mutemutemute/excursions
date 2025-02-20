const { query } = require("express-validator");

const validateSearch = [
  query("name")
    .optional()
    .trim()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Excursion name must be between 1 and 50 characters"),

  query("date")
    .optional()
    .trim()
    .isString()
    .withMessage("Date must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Excursion date must be between 1 and 50 characters"),
];

module.exports = validateSearch;
