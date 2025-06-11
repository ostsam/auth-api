const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.send("Hello World");
});

app.get("/api/public", (_, res) => {
  res.send("This is public information");
});

app.get("/api/protected", (_, res) => {
  res.send("Only admin should be able to see this");
});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
