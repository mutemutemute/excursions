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
    let allExcursions = await sql`
      SELECT excursions.*, categories.name AS category_name
      FROM excursions
      JOIN categories ON excursions.category_id = categories.id
      ORDER BY excursions.id
      ${
        !isNaN(limit) && !isNaN(offset)
          ? sql`LIMIT ${limit} OFFSET ${offset}`
          : sql``
      }
    `;

    if (excursionNameFilter) {
      allExcursions = await sql`
        SELECT excursions.*, categories.name AS category_name
        FROM excursions
        JOIN categories ON excursions.category_id = categories.id
        WHERE excursions.name ILIKE ${excursionNameFilter}
        ORDER BY excursions.id
        ${
          !isNaN(limit) && !isNaN(offset)
            ? sql`LIMIT ${limit} OFFSET ${offset}`
            : sql``
        }
      `;
    }

    const excursionDates = excursionDateFilter
      ? await sql`
          SELECT excursion_dates.*
          FROM excursion_dates
          WHERE excursion_dates.date::text ILIKE ${excursionDateFilter}
        `
      : await sql`
          SELECT excursion_dates.*
          FROM excursion_dates
        `;

    if (excursionDateFilter) {
      const matchingExcursionIds = excursionDates.map((d) => d.excursion_id);
      allExcursions = allExcursions.filter((exc) =>
        matchingExcursionIds.includes(exc.id)
      );

      if (allExcursions.length === 0) {
        return {
          allExcursions: [],
          excursionDates: [],
          registrations: [],
          total_count: 0,
        };
      }
    }

    const registrations = await sql`
      SELECT registrations.*, users.id AS user_id, users.username, users.email
      FROM registrations
      JOIN users ON registrations.user_id = users.id
    `;

    const total_count = allExcursions.length;

    return { allExcursions, excursionDates, registrations, total_count };
  });

  return result;
};

exports.getRegistrations = async () => {
  const registrations = await sql`
SELECT registrations.*, users.id AS user_id, users.username, users.email
FROM registrations
JOIN users ON registrations.user_id = users.id
`;
};
