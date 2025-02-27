const {
  createExcursion,
  getExcursions,
  getRegistrations,
  registerUser,
  updateExcursion,
  deleteExcursion,
  getExcursionsByUser,
  updateRegistration,
  deleteRegistration,
  leaveReview,
  getExcursionByIdModel,
  getUserRegistrationsModel
} = require("../models/excursionModel");

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

    const { allExcursions, total_count } = await getExcursions(
      name,
      date,
      limit,
      offset
    );

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

exports.getExcursionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const excursion = await getExcursionByIdModel(id);
    res.status(200).json({
      status: "success",
      data: excursion,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateThisExcursion = async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    const updatedExcursion = await updateExcursion(id, updatedData);
    res.status(200).json({
      status: "success",
      data: updatedExcursion,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteThisExcursion = async (req, res, next) => {
  const { id } = req.params;
  try {
    await deleteExcursion(id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

exports.getAllRegistrations = async (req, res, next) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
    const registrations = await getRegistrations(limit, offset);
    res.status(200).json({
      status: "success",
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllRegistrationsByUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { page, limit } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
    const registrations = await getUserRegistrationsModel(id, limit, offset);
    res.status(200).json({
      status: "success",
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
}

exports.registerUserToExcursion = async (req, res, next) => {
  try {
    const newRegistration = {
      ...req.body,
      status: "Pending",
      user_id: req.user.id,
    };
    const registration = await registerUser(newRegistration);
    res.status(201).json({
      status: "success",
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateThisRegistration = async (req, res, next) => {
  const { registrationId } = req.params;
  const { excursion_date_id, status } = req.body;

  const isAdmin = req.user && req.user.role === "admin";

  try {
    let updatedData;

    if (isAdmin) {
      if (!status) {
        return res.status(400).json({
          status: "fail",
          message: "Admins can only update the status.",
        });
      }
      updatedData = { status };
    } else {
      if (!excursion_date_id) {
        return res.status(400).json({
          status: "fail",
          message: "Users can only update the excursion date.",
        });
      }
      updatedData = { excursion_date_id };
    }

    const updatedExcursion = await updateRegistration(registrationId, updatedData, isAdmin);

    res.status(200).json({
      status: "success",
      data: updatedExcursion,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteThisRegistration = async (req, res, next) => {
  const { registrationId } = req.params;
  try {
    await deleteRegistration(registrationId);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

exports.getAllExcursionsByUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
    const excursions = await getExcursionsByUser(id, limit, offset);
    res.status(200).json({
      status: "success",
      data: excursions,
    });
  } catch (error) {
    next(error);
  }
};

exports.leaveNewReview = async (req, res, next) => {
  try {
    const review = {
      ...req.body,
      user_id: req.user.id,
    };
    const newReview = await leaveReview(review);
    res.status(200).json({
      status: "success",
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};
