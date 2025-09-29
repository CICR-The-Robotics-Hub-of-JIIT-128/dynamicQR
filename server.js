require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const links = require("./links.json");
const Admins = require("./models/admins");
const session = require("express-session");
const RedirectLink = require("./models/redirectLink");
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3002;

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
app.use(methodOverride('_method')); 
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
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0); 

    const newLinksThisWeek = await RedirectLink.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    const allLinks = await RedirectLink.find({}).sort({ createdAt: -1 });
    const activeLink = allLinks.find((link) => link.isActive);
    const totalLinks = allLinks.length;
    const totalVisits = allLinks.reduce((sum, link) => sum + link.visitCount, 0);
    const activeVisits = activeLink ? activeLink.visitCount : 0;

    res.render("dashboard.ejs", {
      title: "CICR | QR Dashboard",
      links: allLinks,
      activeLink: activeLink,
      totalLinks: totalLinks,
      totalVisits: totalVisits,
      activeVisits: activeVisits,
      newLinksThisWeek: newLinksThisWeek,
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
      activeLink.visitCount++;
      await activeLink.save();
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

app.delete('/delete-link/:id', isAuth, async (req, res) => {
  try {
    const linkId = req.params.id;
    const linkToDelete = await RedirectLink.findById(linkId);

    if (!linkToDelete) {
      return res.status(404).send('Link not found.');
    }

    if (linkToDelete.isActive) {
      return res.status(400).send('Error: Cannot delete the currently active link.');
    }

    await RedirectLink.findByIdAndDelete(linkId);
    console.log(`Link deleted: ${linkId}`);
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Failed to delete link:', error);
    res.status(500).send('Server error while trying to delete the link.');
  }
});

//edit password route
app.get("/passwordChange", isAuth, (req, res)=>{
  res.render("passwordchange.ejs");
});
