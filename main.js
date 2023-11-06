// imports
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const templatePath = path.join(__dirname, "/templates");

// Serve static files from the 'public' directory
app.use(express.static("templates/layout"));
app.set("views", templatePath);
app.use(express.static("uploads"));

const PORT = process.env.PORT || 4000;

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "my secret",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// set template engine
app.set("view engine", "ejs");
// app.set("views", "templates");

// database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected successfully!"));

// routes prefix
app.use("", require("./routes/routes"));

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

app.listen(PORT, () => {
  console.log(`Server is running on port  http://localhost:${PORT}`);
});
