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
    const { excursions, excursionDates, registrations } = await getExcursions();

    if (!Array.isArray(excursions)) {
      throw new Error("Database query did not return an array");
    }

    const allExcursions = excursions.map((excursion) => {
      return {
        ...excursion,
        category_name: excursion.category_name,
        dates: excursionDates
          .filter((date) => date.excursion_id === excursion.id)
          .map((date) => ({
            id: date.id,
            date: date.date,
            time: date.time,
          })),
        registrations: registrations
          .filter((reg) => reg.excursion_id === excursion.id)
          .map((reg) => ({
            user: {
              id: reg.user_id,
              username: reg.username,
              email: reg.email,
            },
            status: reg.status,
          })),
      };
    });

    res.status(200).json({
      status: "success",
      data: allExcursions,
    });
  } catch (error) {
    next(error);
  }
};
