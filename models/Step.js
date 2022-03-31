const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const stepSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxlength: [500, "Le contenu ne peut comporter plus de 500 caractères"],
      minlength: [3, "Le contenu coit comporter au moins 3 caractères"],
      required: [true, "Le contenu est nécessaire"],
    },
    user: { type: ObjectId, ref: "User", required: true },
    process: { type: ObjectId, ref: "Process", required: true },
  },
  { timestamps: true }
);

const Step = mongoose.model("Step", stepSchema);

module.exports = Step;
