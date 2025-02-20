const { validationResult } = require("express-validator");
const AppError = require("../utilities/appError");
const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    console.log(errors);

    const errorString = errors
      .array()
      .map((error) => error.msg)
      .join(";");
    console.log(errorString);
    if (!errors.isEmpty()) {
      throw new AppError(errorString, 400);
    }
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = validate;
