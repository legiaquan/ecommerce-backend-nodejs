const app = require("./src/app");
const configEnv = require("./src/configs/config.mongodb");

const POST = configEnv.app.port || 3056;

const server = app.listen(POST, () => {
  console.log(`WSV eCommerce start with ${POST}`);
});

process.on("SIGINT", () => {
  console.log("SIGINT:: Received SIGINT signal. Closing server...");
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("SIGINT:: Server closed. Exiting process...");
    process.exit(0);
  });
});
