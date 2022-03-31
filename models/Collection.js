const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const collectionSchema = new mongoose.Schema(
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
      minlength: [3, "La description doit comporter au moins 1 caractères"],
      default: "Aucune description",
    },

    user: { type: ObjectId, ref: "User", required: true },

    tasks: [{ type: ObjectId, ref: "Task" }],

    notes: [{ type: ObjectId, ref: "Note" }],

    processes: [{ type: ObjectId, ref: "Process" }],
  },
  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;
