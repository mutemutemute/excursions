const express = require("express");
const { protect, allowAccessTo } = require("../controllers/authController");
const {
  createNewExcursion,
  getAllExcursions,
  getAllRegistrations,
  registerUserToExcursion,
  updateThisExcursion,
  deleteThisExcursion,
  getAllExcursionsByUser,
  updateThisRegistration,
  deleteThisRegistration,
  leaveNewReview,
  getExcursionById,
  getAllRegistrationsByUser,
} = require("../controllers/excursionController");
const validate = require("../validators/validate");
const router = express.Router();
const validateNewExcursion = require("../validators/newexcursion");
const validateReview = require("../validators/review");
const validateSearch = require("../validators/search");
const validatePagination = require("../validators/pagination");
const validateExcursionId = require("../validators/excursionid");
const validateUserId = require("../validators/userid");
const validateRegistrationId = require("../validators/registrationid");
const validateUpdateExcursion = require("../validators/updateexcursion");
const validateRegistration = require("../validators/registration");
const validateUpdateRegistration = require("../validators/updateregistration");

router
  .route("/")
  .post(
    protect,
    allowAccessTo("admin"),
    validateNewExcursion,
    validate,
    createNewExcursion
  )
  .get(validateSearch, validatePagination, validate, getAllExcursions);
router
  .route("/register")
  .get(
    protect,
    allowAccessTo("admin"),
    validatePagination,
    validate,
    getAllRegistrations
  )
  .post(protect, validateRegistration, validate, registerUserToExcursion);

router.route("/review").post(protect, validateReview, validate, leaveNewReview);

router
  .route("/:id")
  .put(
    protect,
    allowAccessTo("admin"),
    validateExcursionId,
    validateUpdateExcursion,
    validate,
    updateThisExcursion
  )
  .delete(
    protect,
    allowAccessTo("admin"),
    validateExcursionId,
    validate,
    deleteThisExcursion
  )
  .get(protect, validateExcursionId, validate, getExcursionById);

router
  .route("/register/:id")
  .put(
    protect,
    validateRegistrationId,
    validateUpdateRegistration,
    validate,
    updateThisRegistration
  )
  .delete(protect, validateRegistrationId, validate, deleteThisRegistration)
  .get(protect, validateUserId, validate, getAllRegistrationsByUser)
  

  
router
  .route("/users/:id")
  .get(
    protect,
    validatePagination,
    validateUserId,
    validate,
    getAllExcursionsByUser
  );

  module.exports = router;
