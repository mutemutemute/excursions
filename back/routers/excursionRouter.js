const express = require("express");
const { protect } = require("../controllers/authController");
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
} = require("../controllers/excursionController");
const validate = require("../validators/validate");
const router = express.Router();

router
  .route("/")
  .post(validate, createNewExcursion)
  .get(validate, getAllExcursions);
router
  .route("/register")
  .get(validate, getAllRegistrations)
  .post(protect, validate, registerUserToExcursion);

router.route("/review").post(protect, leaveNewReview);

router
  .route("/:id")
  .put(validate, updateThisExcursion)
  .delete(validate, deleteThisExcursion)
  .get(protect, validate, getAllExcursionsByUser);

router
  .route("/registration/:id")
  .put(protect, validate, updateThisRegistration)
  .delete(protect, validate, deleteThisRegistration);
module.exports = router;
