"use strict";

const mongoose = require("mongoose");

const connectString = "mongodb://localhost:27017/shopDev";

mongoose
  .connect(connectString)
  .then((_) => console.log(`Connected Mongo DB sucess`))
  .catch((err) => console.error(`Error`));

if (1 === 0) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
