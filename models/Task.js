const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const taskSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Le contenu est indispensable"],
      minlength: [3, "Le contenu doit comporter au moins 3 caractères"],
      maxlength: [280, "Le contenu ne peut comporter plus de 280 caractères"],
      trim: true,
    },
    user: { type: ObjectId, ref: "User", required: true },
    isCompositeTask: { type: Boolean, default: false },
    limitDate: { type: Date, default: null },
    isDone: { type: Boolean, default: false },

    subtasks: [{ type: ObjectId, ref: "Subtask" }],

    collections: [{ type: ObjectId, ref: "Collection" }],
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
