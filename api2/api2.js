const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Response from API 2 (fast)");
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`API 2 listening on port ${PORT}`);
});
