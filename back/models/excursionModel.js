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
    let excursions = sql`
      SELECT excursions.*, categories.name AS category_name, 
             json_agg(
               json_build_object(
                 'id', excursion_dates.id,
                 'date', excursion_dates.date,
                 'time', excursion_dates.time
               ) ORDER BY excursion_dates.date
             ) AS dates
      FROM excursions
      JOIN categories ON excursions.category_id = categories.id
      LEFT JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
    `;
    let total_count = null;

    if (excursionNameFilter && excursionDateFilter) {
      excursions = sql`${excursions}
        WHERE excursions.name ILIKE ${excursionNameFilter}
        AND excursion_dates.date::text ILIKE ${excursionDateFilter}
      `;
      const [totalExcursions] = await sql`
        SELECT COUNT(*) AS total
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
        SELECT COUNT(*) AS total
        FROM excursions
        WHERE excursions.name ILIKE ${excursionNameFilter}
        `;
      total_count = totalExcursions.total;
    } else if (excursionDateFilter) {
      excursions = sql`${excursions}
        WHERE excursion_dates.date::text ILIKE ${excursionDateFilter}

      `;
      const [totalExcursions] = await sql`
        SELECT COUNT(*) AS total
        FROM excursions
        JOIN excursion_dates ON excursions.id = excursion_dates.excursion_id
        WHERE excursion_dates.date::text ILIKE ${excursionDateFilter}
        `;
      total_count = totalExcursions.total;
    }

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
