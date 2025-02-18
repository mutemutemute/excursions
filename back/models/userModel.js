const { sql } = require("../dbConnection");

exports.createUser = async (newUser) => {
  const result = await sql.begin(async (sql) => {
    const [user] = await sql`
          INSERT INTO users ${sql(newUser, "username", "email", "role")}
          RETURNING *
          `;

    await sql`
         INSERT INTO user_secrets ${sql({ user_id: user.id, password: newUser.password }, "user_id", "password")}
         RETURNING *`;

    return user;
  });

  return result;
};

exports.getUserByEmail = async (email) => {
  const [user] = await sql`
      SELECT users.* , user_secrets.password
      FROM users 
      JOIN user_secrets ON users.id = user_secrets.user_id
      WHERE users.email = ${email}`;
  return user;
};

exports.getUserById = async (id) => {
  const [user] = await sql`
      SELECT users.* 
      FROM users 
      WHERE users.id = ${id}`;
  return user;
};
