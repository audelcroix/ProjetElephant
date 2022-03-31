const mongoose = require("mongoose");

require("dotenv").config({ path: "./config/.env" });

//const dbUrl = process.env.DB_URL;
//const dbUrl = "mongodb://localhost:27017/elephantDB";

const dbUrl =
  process.env.NODE_ENV == "production"
    ? process.env.DB_URL
    : "mongodb://localhost:27017/elephantDB";

mongoose.connect(
  dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  (err, db) => {
    if (err) {
      console.log(err);
    } else {
      console.log("DATABASE CONNECTED");
    }
  }
);
