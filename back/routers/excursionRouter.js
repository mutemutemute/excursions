const express = require("express");

const {createNewExcursion, getAllExcursions} = require("../controllers/excursionController");
const validate = require("../validators/validate");
const router = express.Router();

router.route("/").post(validate, createNewExcursion).get(validate, getAllExcursions);

module.exports = router;