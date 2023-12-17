"use strict";

const dev = {
  app: {
    port: process.env.APP_PORT,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
  },
};

const prod = {
  app: {
    port: process.env.PORT,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
  },
};

const config = { dev, prod };
const env = process.env.NODE_ENV || "dev";

const configEnv = config[env] || config["dev"];
console.log("configEnv: ", configEnv);

module.exports = configEnv;
