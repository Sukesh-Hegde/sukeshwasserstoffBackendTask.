const express = require("express");
const app = express();

app.get("/", (req, res) => {
  setTimeout(() => {
    res.send("Response from API 1 (slow)");
  }, 3000); // 3 seconds delay
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API 1 listening on port ${PORT}`);
});
