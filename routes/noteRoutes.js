const router = require("express").Router();
const noteController = require("../controllers/noteController");

const { protect } = require("../middlewares/auth");

const { body } = require("express-validator");

router
  .route("/new_note")
  .post(
    protect,
    body("content")
      .isLength({ min: 3, max: 300 })
      .withMessage(
        "Le contenu d'une note doit être compris entre 3 et 300 caractères"
      )
      .trim()
      .escape(),
    noteController.createNote
  );

router.route("/get_note/:id").get(protect, noteController.getNote);

router
  .route("/edit_note/:id")
  .patch(
    protect,
    body("content")
      .isLength({ min: 3, max: 300 })
      .withMessage(
        "Le contenu d'une note doit être compris entre 3 et 300 caractères"
      )
      .trim()
      .escape(),
    noteController.editNote
  );

router.route("/delete_note/:id").delete(protect, noteController.deleteNote);

router.route("/get_all_notes").get(protect, noteController.getAllUserNotes);

router
  .route("/add_to_collection")
  .patch(protect, noteController.addNoteToCollection);

router
  .route("/remove_from_collection")
  .patch(protect, noteController.removeNoteFromCollection);

router
  .route("/testo")
  .get(noteController.testnotes)
  .post(noteController.testpost);

module.exports = router;
