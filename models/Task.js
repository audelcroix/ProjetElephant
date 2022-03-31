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

// FONCTIONNE MAIS FAIT UN APPEL EVITABLE A LA BASE DE DONNEES
/* taskSchema.pre("save", function (next) {
  const now = new Date();

  if (this.limitDate < now) {
    // Limit date cannot be in the past
    const dateErr = new Error();
    dateErr.error_msg = "La date doit être dans le futur";
    next(dateErr);
  } else {
    next();
  }

  next();
}); */

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
