const path = require("path");
const express = require("express");
const passport = require("passport");

require("dotenv").config();
require("./src/config/passport");
const indexRoute = require("./src/routes/index.route");
const { globalErrorHandler } = require("./src/middlewares/globalErrorHandeler");
const connectDB = require("./src/config/db");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "src/public/uploads")));

app.use(passport.initialize());
app.use("/api", indexRoute);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});
app.use(globalErrorHandler);

module.exports = app;
