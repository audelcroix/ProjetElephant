const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const processSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est nécessaire"],
      minlength: [3, "Le titre doit comporter au moins 3 caractères"],
      maxlength: [140, "Le titre ne peut comporter plus de 140 caractères"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "La description ne peut comporter plus de 500 caractères",
      ],
      minlength: [3, "La description doit comporter au moins 3 caractères"],
      default: "Aucune description",
    },
    user: { type: ObjectId, ref: "User", required: true },

    steps: [{ type: ObjectId, ref: "Step" }],

    collections: [{ type: ObjectId, ref: "Collection" }],
  },
  { timestamps: true }
);

const Process = mongoose.model("Process", processSchema);

module.exports = Process;
