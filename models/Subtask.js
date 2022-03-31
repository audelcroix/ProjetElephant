const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const subtaskSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxlength: [280, "Le contenu ne peut comporter plus de 280 caractères"],
      minlength: [3, "Le contenu doit comporter au moins 3 caractères"],
    },
    user: { type: ObjectId, ref: "User", required: true },
    task: { type: ObjectId, ref: "Task", required: true },
    limitDate: { type: Date, default: null },
    isDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Subtask = mongoose.model("Subtask", subtaskSchema);

module.exports = Subtask;
