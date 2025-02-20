const { sql } = require("../dbConnection");

exports.createExcursion = async (newExcursion) => {
  const result = await sql.begin(async (sql) => {
    const [category] = await sql`
        SELECT categories.* FROM categories WHERE name = ${newExcursion.category_type};
    `;

    if (!category) {
      throw new Error(`Category '${newExcursion.category_type}' not found.`);
    }

    const fullExcursion = { ...newExcursion, category_id: category.id };

    const [excursion] = await sql`
        INSERT INTO excursions ${sql(fullExcursion, "name", "image_url", "duration", "price", "user_rating", "category_id", "description")}
        RETURNING *;
        `;

    if (!Array.isArray(fullExcursion.dates)) {
      throw new Error("Dates must be an array");
    }

    const dates = await sql`
        INSERT INTO excursion_dates ${sql(
          fullExcursion.dates.map((d) => ({
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

    return { excursion, dates, category };
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
  const columns = Object.keys(updatedExcursion);
  const [excursion] = await sql`
      UPDATE excursions
      SET ${sql(updatedExcursion, ...columns)}
      WHERE id = ${id}
      RETURNING *;
    `;

  return excursion;
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

exports.updateRegistration = async (id, newDate, newTime) => {
  const [dateRecord] = await sql`
      SELECT id FROM excursion_dates WHERE date = ${newDate}
      AND time = ${newTime}
      AND excursion_id = ${id}

      ;
    `;

  if (!dateRecord) {
    throw new Error("Date not found in excursion_dates");
  }

  const [excursion] = await sql`
      UPDATE registrations
      SET excursion_date_id = ${dateRecord.id}
      WHERE id = ${id}
      RETURNING *;
    `;

  return excursion;
};

exports.deleteRegistration = async (id) => {
  const [registration] = await sql`
      DELETE FROM registrations
      WHERE registrations.id = ${id}
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
  const [excursion] = await sql`
    SELECT id FROM excursions WHERE name = ${newReview.excursion_name};
  `;

  if (!excursion) {
    throw new Error("Excursion not found");
  }

  const [review] = await sql`
    INSERT INTO reviews ${sql(
      {
        ...newReview,
        excursion_id: excursion.id,
      },
      "excursion_id",
      "name",
      "user_id",
      "rating",
      "comment"
    )}
    RETURNING *;
  `;

  return review;
};
