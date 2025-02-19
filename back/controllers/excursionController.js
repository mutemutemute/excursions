const { createExcursion, getExcursions } = require("../models/excursionModel");

exports.createNewExcursion = async (req, res, next) => {
  try {
    const newExcursion = {
      ...req.body,
      user_rating: req.body.user_rating || 0,
    };

    if (newExcursion.dates && !Array.isArray(newExcursion.dates)) {
      newExcursion.dates = [newExcursion.dates];
    }
    const createdExcursion = await createExcursion(newExcursion);

    const fullExcursion = {
      ...createdExcursion.excursion,
      dates: createdExcursion.dates,
      category_name: createdExcursion.category.name,
    };
    res.status(201).json({
      status: "success",
      data: fullExcursion,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllExcursions = async (req, res, next) => {
  try {
    let { name, date, page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const offset = (page - 1) * limit;

    const { allExcursions, total_count } = await getExcursions(name, date, limit, offset);
    
    if (!Array.isArray(allExcursions)) {
      throw new Error("Database query did not return an array");
    }

    res.status(200).json({
      status: "success",
      data: {
        excursions: allExcursions,
        total_count: total_count,
      },
    });
  } catch (error) {
    next(error);
  }
};

