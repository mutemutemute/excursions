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
        INSERT INTO excursions ${sql(fullExcursion, "name", "image_url", "duration", "price", "user_rating", "category_id")}
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

exports.getExcursions = async () => {
  const result = await sql.begin(async (sql) => {
    const excursions = await sql`
    SELECT excursions.*, categories.name AS category_name
    FROM excursions
    JOIN categories ON excursions.category_id = categories.id
    
  `;

    const excursionDates = await sql`
    SELECT excursion_dates.*
    FROM excursion_dates
    `;

    const registrations = await sql`
    SELECT registrations.*, users.id AS user_id, users.username, users.email
    FROM registrations
    JOIN users ON registrations.user_id = users.id
    `;

    return { excursions, excursionDates, registrations };
  });
  return result;
};
