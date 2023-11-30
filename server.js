const app = require("./src/app");

const POST = process.env.PORT || 3056;

const server = app.listen(POST, () => {
  console.log(`WSV eCommerce start with ${POST}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit Server Express"));
});
