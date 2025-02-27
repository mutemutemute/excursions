const { sql } = require("../dbConnection");

exports.createExcursion = async (newExcursion) => {
  const result = await sql.begin(async (sql) => {
    const [excursion] = await sql`
        INSERT INTO excursions ${sql(newExcursion, "name", "image_url", "duration", "price", "user_rating", "category_id", "description")}
        RETURNING *;
        `;

    if (!Array.isArray(newExcursion.dates)) {
      throw new Error("Dates must be an array");
    }

    const dates = await sql`
        INSERT INTO excursion_dates ${sql(
          newExcursion.dates.map((d) => ({
            excursion_id: excursion.id,
            date: d.date,
            time: d.time,
          })),
          "excursion_id",
          "date",
          "time"
        )}
        RETURNING *;
    `;

    return { excursion, dates };
  });

  return result;
};

exports.getExcursions = async (name, date, limit, offset) => {
  const excursionNameFilter = name ? `%${name}%` : null;
  const excursionDateFilter = date ? `%${date}%` : null;

  const result = await sql.begin(async (sql) => {
    // jsonb_build_object (instead of json_build_object) allows to use DISTINCT
    let excursions = sql`
      SELECT excursions.*, categories.name AS category_name, 
             jsonb_agg(
               DISTINCT jsonb_build_object(
                 'id', excursion_dates.id,
                 'date', excursion_dates.date,
                 'time', excursion_dates.time
               )
             ) FILTER (WHERE excursion_dates.id IS NOT NULL) AS dates,

             jsonb_agg(
               DISTINCT jsonb_build_object(
                 'id', reviews.id,
                 'name', reviews.name,
                 'user_id', reviews.user_id,
                 'rating', reviews.rating,
                 'comment', reviews.comment,
                 'created_at', reviews.created_at
               )
             ) FILTER (WHERE reviews.id IS NOT NULL) AS reviews
      FROM excursions
      JOIN categories ON excursions.category_id = categories.id
      LEFT JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
      LEFT JOIN reviews ON excursions.id = reviews.excursion_id
    `;
    // when using LEFT JOIN and FILTER it lists excursions without dates and reviews yet
    let total_count = null;

    if (excursionNameFilter && excursionDateFilter) {
      excursions = sql`${excursions}
        WHERE excursions.name ILIKE ${excursionNameFilter}
        AND excursion_dates.date::text ILIKE ${excursionDateFilter}
      `;

      // DISTINCT avoids duplicates when counting, fixes total_count
      const [totalExcursions] = await sql`
        SELECT COUNT(DISTINCT excursions.id) AS total
        FROM excursions
        JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
        WHERE excursions.name ILIKE ${excursionNameFilter}
        AND excursion_dates.date::text ILIKE ${excursionDateFilter}
      `;
      total_count = totalExcursions.total;
    } else if (excursionNameFilter) {
      excursions = sql`${excursions}
        WHERE excursions.name ILIKE ${excursionNameFilter}
      `;
      const [totalExcursions] = await sql`
        SELECT COUNT(DISTINCT excursions.id) AS total
        FROM excursions
        WHERE excursions.name ILIKE ${excursionNameFilter}
      `;
      total_count = totalExcursions.total;
    } else if (excursionDateFilter) {
      excursions = sql`${excursions}
        WHERE excursion_dates.date::text ILIKE ${excursionDateFilter}
      `;
      const [totalExcursions] = await sql`
        SELECT COUNT(DISTINCT excursions.id) AS total
        FROM excursions
        JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
        WHERE excursion_dates.date::text ILIKE ${excursionDateFilter}
      `;
      total_count = totalExcursions.total;
    } else {
      const [totalExcursions] = await sql`
        SELECT COUNT(*) AS total
        FROM excursions
      `;
      total_count = totalExcursions.total;
    }

    // apply pagination
    excursions = sql`${excursions}
      GROUP BY excursions.id, categories.name
      ORDER BY excursions.id
      ${!isNaN(limit) && !isNaN(offset) ? sql`LIMIT ${limit} OFFSET ${offset}` : sql``}
    `;

    const allExcursions = await excursions;

    return { allExcursions, total_count };
  });

  return result;
};

exports.updateExcursion = async (id, updatedExcursion) => {
  const result = await sql.begin(async (sql) => {
    //Update the main excursion record (excluding 'dates')
    const excursionColumns = Object.keys(updatedExcursion).filter(
      (key) => key !== "dates"
    );

    const [excursion] = await sql`
      UPDATE excursions
      SET ${sql(updatedExcursion, ...excursionColumns)}
      WHERE id = ${id}
      RETURNING *;
    `;

    // Fetch all existing date IDs for this excursion
    const existingDateRows = await sql`
      SELECT id
      FROM excursion_dates
      WHERE excursion_id = ${id};
    `;
    const existingDateIds = new Set(existingDateRows.map((row) => row.id));

    // Build a set of IDs from the new payload (for existing dates)
    const payloadIds = new Set(
      (updatedExcursion.dates || [])
        .filter((d) => d.id && parseInt(d.id, 10) > 0)
        .map((d) => parseInt(d.id, 10))
    );

    // Delete any date that no longer appears in the payload
    for (const existingId of existingDateIds) {
      if (!payloadIds.has(existingId)) {
        await sql`
          DELETE FROM excursion_dates
          WHERE id = ${existingId}
        `;
      }
    }

    // Update or insert dates
    let updatedDates = [];
    if (updatedExcursion.dates && updatedExcursion.dates.length > 0) {
      for (const date of updatedExcursion.dates) {
        let updatedDate;
        if (date.id && parseInt(date.id, 10) > 0) {
          // Update existing
          [updatedDate] = await sql`
            UPDATE excursion_dates
            SET date = ${date.date}, time = ${date.time}
            WHERE id = ${date.id}
            RETURNING *;
          `;
        } else {
          // Insert new
          [updatedDate] = await sql`
            INSERT INTO excursion_dates (excursion_id, date, time)
            VALUES (${id}, ${date.date}, ${date.time})
            RETURNING *;
          `;
        }
        updatedDates.push(updatedDate);
      }
    }

    return { excursion, dates: updatedDates };
  });

  return result;
};





exports.deleteExcursion = async (id) => {
  const [excursion] = await sql`
      DELETE FROM excursions
      WHERE excursions.id = ${id}
      RETURNING *;
    `;

  return excursion;
};

exports.getRegistrations = async (limit, offset) => {
  const registrations = await sql`
SELECT registrations.*,excursions.name AS excursion_name, excursion_dates.date, excursion_dates.time, users.id AS user_id, users.username, users.email
FROM registrations
JOIN users ON registrations.user_id = users.id
JOIN excursion_dates ON registrations.excursion_date_id = excursion_dates.id
JOIN excursions ON excursion_dates.excursion_id = excursions.id
 ${
   !isNaN(limit) && !isNaN(offset)
     ? sql`LIMIT ${limit} OFFSET ${offset}`
     : sql``
 }
`;
  const [totalRegistrations] = await sql`
SELECT COUNT(registrations.id) AS total
FROM registrations`;
  const total_count = totalRegistrations.total;
  return { registrations, total_count };
};

exports.registerUser = async (newRegistration) => {
  const [registration] = await sql`
    INSERT INTO registrations ${sql(newRegistration, "excursion_id", "user_id", "excursion_date_id", "status")}
    RETURNING *;
    `;

  return registration;
};

exports.getUserRegistrationsModel = async (id, limit, offset) => {
  const registrations = await sql`
  SELECT registrations.*,excursions.name AS excursion_name, excursion_dates.date, excursion_dates.time, users.id AS user_id, users.username, users.email
  FROM registrations
  JOIN users ON registrations.user_id = users.id
  JOIN excursion_dates ON registrations.excursion_date_id = excursion_dates.id
  JOIN excursions ON excursion_dates.excursion_id = excursions.id
  WHERE registrations.user_id = ${id}
   ${
   !isNaN(limit) && !isNaN(offset)
     ? sql`LIMIT ${limit} OFFSET ${offset}`
     : sql``
 }
  `;
  const [totalRegistrations] = await sql`
  SELECT COUNT(registrations.id) AS total
  FROM registrations
  WHERE registrations.user_id = ${id}`;
  const total_count = totalRegistrations.total;
  return { registrations, total_count };
}

exports.updateRegistration = async (
  registrationId,
  updatedRegistration,
  isAdmin = false
) => {
  let updatedFields;

  if (isAdmin) {
    //if admin wants to update everything
    // const columns = Object.keys(updatedRegistration);
    // [updatedFields] = await sql`
    //   UPDATE registrations
    //   SET ${sql(updatedRegistration, ...columns)}
    //   WHERE id = ${id}
    //   RETURNING *;
    // `;

    if (!updatedRegistration.status) {
      throw new Error("Admins can only update 'status'");
    }

    [updatedFields] = await sql`
      UPDATE registrations
      SET status = ${updatedRegistration.status}
      WHERE id = ${registrationId}
      RETURNING *;
    `;
  } else {
    if (!updatedRegistration.excursion_date_id) {
      throw new Error("Regular users can only update 'excursion_date_id'");
    }

    [updatedFields] = await sql`
      UPDATE registrations
      SET excursion_date_id = ${updatedRegistration.excursion_date_id}
      WHERE id = ${registrationId}
      RETURNING *;
    `;
  }

  return updatedFields;
};

exports.deleteRegistration = async (registrationId) => {
  const [registration] = await sql`
      DELETE FROM registrations
      WHERE registrations.id = ${registrationId}
      RETURNING *;
    `;

  return registration;
};

exports.getExcursionsByUser = async (id, limit, offset) => {
  const excursions = await sql`
    SELECT excursions.*, categories.name AS category_name, excursion_dates.date, excursion_dates.time, registrations.*
    FROM excursions
    JOIN categories ON excursions.category_id = categories.id
    JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
    JOIN registrations ON excursion_dates.id = registrations.excursion_date_id
    WHERE registrations.user_id = ${id}
    ORDER BY excursions.id
    ${
      !isNaN(limit) && !isNaN(offset)
        ? sql`LIMIT ${limit} OFFSET ${offset}`
        : sql``
    }
  `;
  const [totalExcursions] = await sql`
    SELECT COUNT(*) AS total
    FROM excursions
    JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
    JOIN registrations ON excursion_dates.id = registrations.excursion_date_id
    WHERE registrations.user_id = ${id}
  `;
  const total_count = totalExcursions.total;

  return { excursions, total_count };
};

exports.leaveReview = async (newReview) => {
  const reviewData = {
    ...newReview,
    comment: newReview.comment || null,
  };
  const [review] = await sql`
        INSERT INTO reviews ${sql(reviewData, "excursion_id", "name", "user_id", "rating", "comment")}
        RETURNING *;
        `;
  return review;
};

exports.getCategoryId = async (id) => {
  const [category] = await sql`
  SELECT categories.*
  FROM categories 
  WHERE categories.id = ${id};
  `;
  return category;
};

exports.getExcursionByIdModel = async (id) => {
  const [excursion] = await sql`
    SELECT excursions.*, 
           categories.name AS category_name,
           jsonb_agg(
             DISTINCT jsonb_build_object(
               'id', excursion_dates.id,
               'date', excursion_dates.date,
               'time', excursion_dates.time
             )
           ) FILTER (WHERE excursion_dates.id IS NOT NULL) AS dates
    FROM excursions
    JOIN categories ON excursions.category_id = categories.id
    LEFT JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
    WHERE excursions.id = ${id}
    GROUP BY excursions.id, categories.name;
  `;
  return excursion;
};


exports.getUserWithRegistrations = async (id) => {
  const [user] = await sql`
  SELECT users.*, registrations.excursion_date_id
  FROM users 
  JOIN registrations ON users.id = registrations.user_id
  WHERE users.id = ${id};
  `;
  return user;
};

exports.getRegistrationById = async (registrationId) => {
  const [registration] = await sql`
  SELECT registrations.*
  FROM registrations 
  WHERE registrations.id = ${registrationId};
  `;
  return registration;
};

exports.getExcursionDateById = async (id) => {
  const [excursionDate] = await sql`
  SELECT excursion_dates.*
  FROM excursion_dates 
  WHERE excursion_dates.id = ${id};
  `;
  
  return excursionDate;
};
