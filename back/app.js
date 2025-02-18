const express = require("express");
const AppError = require("./utilities/appError");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const excursionRouter = require("./routers/excursionRouter");

 
// create server
const app = express();


// Middleware - parsed data to req.body.
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/excursions", excursionRouter);

app.all('*', (req, res, next) => {
  
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
});
 

app.use(errorHandler)



module.exports = app;








