const app = require("./app")
const dotenv = require("dotenv");
const { sql, testConnection } = require("./dbConnection")

// loads environment variables from .env file
dotenv.config();
const port = process.env.PORT;


(async () => {
  try {
    //1. test database connection
    await testConnection();

    //2. server start
    app.listen(port, () => {
      console.log(`App running on port ${port}`);
    });
  } catch (error) {
    // terminate the running application if the database connection fails, 1 means error
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    console.log("Closing database connection ...");
    // closes all database connections
    await sql.end();
    // 1 when error occurs , 0 when there's no error
    process.exit(0);
  });
})();


