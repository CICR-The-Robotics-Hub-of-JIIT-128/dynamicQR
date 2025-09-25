const express = require("express");
const app = express();
const PORT = 3000;

app.get("/r/:id", (req, res) => {
  const { id } = req.params;
  console.log(`QR scanned! ID: ${id}, Time: ${new Date().toISOString()}`);
  res.send(`QR ${id} scanned! Check your terminal.`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
