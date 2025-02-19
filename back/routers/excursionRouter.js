const express = require("express");
const { protect } = require("../controllers/authController");
const {createNewExcursion, getAllExcursions, getAllRegistrations, registerUserToExcursion} = require("../controllers/excursionController");
const validate = require("../validators/validate");
const router = express.Router();

router.route("/").post(validate, createNewExcursion).get(validate, getAllExcursions);
router.route("/register").get(validate, getAllRegistrations).post(protect, validate, registerUserToExcursion);

module.exports = router;