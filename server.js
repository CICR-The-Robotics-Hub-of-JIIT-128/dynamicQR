require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const links = require("./links.json");
const Admins = require("./models/admins");
const session = require("express-session");
const RedirectLink = require("./models/redirectLink");

const app = express();
const PORT = 3000;

let path = "";
const dbURI = process.env.DB_URI;
  mongoose
  .connect(dbURI)
  .then((result) => {
    console.log("connected to db");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to db");
  });

app.set("view-engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

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
  res.render("login.ejs", { title: "QR Redirect" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("username recieved: " + username);
  console.log("password recieved: " + password);
  try {
    const admin = await Admins.findOne({ username });

    if (!admin) {
      return res.status(401).send("Invalid username or password");
    }

    if (admin.password === password) {
      req.session.isAuth = true;
      res.redirect("/dashboard");
    } else {
      return res.status(401).send("Invalid username or password");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/admin");
  }
};

app.get("/dashboard", isAuth, async (req, res) => {
  try {
    const allLinks = await RedirectLink.find({}).sort({ createdAt: -1 });
    const activeLink = allLinks.find((link) => link.isActive);
    res.render("dashboard.ejs", {
      title: "CICR | QR Dashboard",
      links: allLinks,
      activeLink: activeLink,
    });
  } catch (err) {
    console.log("Error fetching links:", err);
    res.redirect("/admin");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.redirect("/dashboard");
    } else {
      res.redirect("/admin");
    }
  });
});

app.post("/update-link", isAuth, async (req, res) => {
  try {
    const linkUrl = req.body.newLinkUrl;
    const newLink = new RedirectLink({
      url: linkUrl,
    });

    await newLink.save();
    console.log("New link saved successfully", linkUrl);
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error saving link : ", err);
    resizeBy.redirect("/dashboard");
  }
});

app.post("/set-active/:id", isAuth, async (req, res) => {
  try {
    await RedirectLink.updateMany({}, { isActive: false });
    await RedirectLink.findByIdAndUpdate(req.params.id, { isActive: true });
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error setting active link : ", err);
    res.redirect("/dashboard");
  }
});

app.get("/go", async (req, res) => {
  try {
    const activeLink = await RedirectLink.findOne({ isActive: true });

    if (activeLink) {
      console.log(`Redirecting to active link: ${activeLink.url}`);
      res.redirect(activeLink.url);
    } else {
      res
        .status(404)
        .send("<h1>No active link is currently set by the administrator.</h1>");
    }
  } catch (err) {
    console.error("Error finding active link:", err);
    res.status(500).send("<h1>Server error. Please try again later.</h1>");
  }
});
