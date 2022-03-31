const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxlength: [3000, "Le contenu est limité à 3000 caractères"],
      minlength: [3, "Le contenu doit comporter au moins 3 caractères"],
      required: [true, "Le contenu est indispensable"],
    },

    user: { type: ObjectId, ref: "User", required: true },

    collections: [{ type: ObjectId, ref: "Collection" }],
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
