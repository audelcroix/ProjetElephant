const express = require("express");
const mongoose = require("mongoose");

const path = require("path");

require("dotenv").config({ path: "./config/.env" });

const cors = require("cors");

const app = express();

const dbUrl =
  process.env.NODE_ENV == "production"
    ? process.env.DB_URL
    : "mongodb://localhost:27017/elephantDB";

app.use(cors());

const PORT = process.env.PORT || 5000;

// for the requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));
app.use("/api/processes", require("./routes/processRoutes"));
app.use("/api/collections", require("./routes/collectionRoutes"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
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

    // must be last
    app.listen(PORT, () => {
      console.log(`Elephant online on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DATABASE NOT ONLINE");
    console.log(err);
  });
