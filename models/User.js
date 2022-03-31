const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const slugify = require("slugify");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Un pseudo est nécessaire"],
      minLength: [3, "Votre pseudo doit comporter au moins 3 caractères"],
      maxLength: [55, "Votre pseudo doit comporter 55 caractères maximum"],
      unique: true,
      trim: true,
    },

    slugUsername: {
      type: String,
      unique: true,
      index: true,
    },

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

    // a verifier suivant le dossier statics
    avatar: {
      type: String,
      default: "defaultAvatar.jpg",
    },

    theme: {
      type: String,
      enum: ["spring", "summer", "autumn", "winter"],
      default: "spring",
    },

    // Pas utilisés
    // ON VA FINALEMENT CHARGER DE PUIS LA BDD ET PAS PAR UN POPULATE
    tasks: [{ type: ObjectId, ref: "Task" }],

    processes: [{ type: ObjectId, ref: "Process" }],

    notes: [{ type: ObjectId, ref: "Note" }],

    collections: [{ type: ObjectId, ref: "Collection" }],
  },
  {
    timestamps: true,
  }
);

// valider si user deja existant avec le slug et pas le username
userSchema.pre("save", function (next) {
  this.slugUsername = slugify(this.username, { lower: true });
  next();
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
