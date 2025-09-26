const express = require("express");
const links = require("./links.json");
const app = express();
const PORT = 3001;

let path = "";

function getPath(val = 0) {
  console.log(links[val].linkAddress);
  path = links[val].linkAddress.toString();
}
app.get("/", (req, res) => {
  console.log("root page requested");
  res.send("<h1>This Zone is restricted</h1>");
});
app.get("/cicrRoot", (req, res) => {
  console.log(`QR scanned!, Time: ${new Date().toISOString()}`);
  getPath();
  res.redirect(path);
});
app.get("/admin", (req, res) => {
  console.log(`Admin Login Requested`);
  res.sendFile("./admin/login.html", { root: __dirname });
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
