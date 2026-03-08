const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("PostLoop API Running"));

module.exports = app;
