const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");

require("dotenv").config({ path: "./config/.env" });

const cors = require("cors");

const app = express();

// Set security Http headers
app.use(helmet({ contentSecurityPolicy: false }));

// Limit requests from same API
// 100 requests within 10 minutes
const limiter = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 10,
  message:
    "Cette adresse IP a émis trop de requêtes, veuillez réessayer dans 10 minutes",
});

// limiter is middleware
app.use("/api", limiter);

const dbUrl =
  process.env.NODE_ENV == "production"
    ? process.env.DB_URL
    : "mongodb://localhost:27017/elephantDB";

app.use(cors());

const PORT = process.env.PORT || 5000;

// Body parser to read data from the body of the requests into req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));

// Data sanitization against no-sql query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// ROUTES
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));
app.use("/api/processes", require("./routes/processRoutes"));
app.use("/api/collections", require("./routes/collectionRoutes"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // set static folder
  /* app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  }); */

  app.use(express.static(path.resolve(__dirname, "./client/build")));

  app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  });
}

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => {
    const MODE =
      process.env.NODE_ENV == "production" ? "PRODUCTION" : "DEVELOPMENT";

    console.log(`Database connected, mode: ${MODE}`);

    // MUST BE LAST
    app.listen(PORT, () => {
      console.log(`Elephant online on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DATABASE NOT ONLINE");
    console.log(err);
  });
