const express = require("express");
const passport = require("passport");
const indexRoute = require("./src/routes/index.route");
require("./src/config/passport");
const globalErrorHandler = require("./src/middlewares/globalErrorHandeler");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use("/api", indexRoute);

app.use(globalErrorHandler);

module.exports = app;
