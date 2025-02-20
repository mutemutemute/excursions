const { body } = require("express-validator");
const { getCategoryId } = require("../models/excursionModel");
const imgUrlRegex =
  /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg|webp|tiff)(\?.*)?$/;
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
const validateUpdateExcursion = [
  body("name")
    .trim()
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  body("image_url")
    .trim()
    .optional()
    .isString()
    .withMessage("Image URL must be a string")
    .matches(imgUrlRegex)
    .withMessage("Image URL must be a valid URL"),

  body("duration")
    .trim()
    .optional()
    .matches(timeRegex)
    .withMessage("Duration must be in the format HH:MM:SS"),

  body("price")
    .trim()
    .optional()
    .isInt({ min: 0 })
    .withMessage("Price must be a positive integer"),

  body("user_rating")
    .trim()
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("User rating must be a number between 0 and 5"),

  body("category_id")
    .trim()
    .optional()
    .isInt({ min: 0 })
    .withMessage("Category type must be a positive integer")
    .bail()
    .custom(async (value) => {
      const category = await getCategoryId(value);
      if (!category) {
        throw new Error(`Category '${value}' not found.`);
      }
      return true;
    }),

  body("description")
    .trim()
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

module.exports = validateUpdateExcursion;
