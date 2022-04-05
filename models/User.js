const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Un email est nécessaire"],
      unique: [true, "Cet email est déjà utilisé"],
      validate: [isEmail],
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      maxLength: [
        1024,
        "Votre mot de passe ne peut comporter plus de 1024 caractères",
      ],
      minLength: [6, "Votre mot de passe doit comporter au moins 6 caractères"],
      required: [true, "Un mot de pass est indispensable"],
    },

    theme: {
      type: String,
      enum: ["spring", "summer", "autumn", "winter"],
      default: "spring",
    },

    tasks: [{ type: ObjectId, ref: "Task" }],

    processes: [{ type: ObjectId, ref: "Process" }],

    notes: [{ type: ObjectId, ref: "Note" }],

    collections: [{ type: ObjectId, ref: "Collection" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
