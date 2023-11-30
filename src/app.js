require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");

const app = express();

// Initialize middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// Initialize database
require("./dbs/init.mongodb");
const { checkOverload } = require("./helpers/check.connect");
// checkOverload();

// Initialize route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World!",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = app;
