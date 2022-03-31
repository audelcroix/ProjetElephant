const router = require("express").Router();
const processController = require("../controllers/processController");

const { body } = require("express-validator");

const { protect } = require("../middlewares/auth");

router
  .route("/new_process")
  .post(
    protect,
    body("title")
      .trim()
      .escape()
      .isLength({ min: 3, max: 140 })
      .withMessage("Le titre doit comporter entre 3 et 140 caractères"),
    body("description")
      .trim()
      .escape()
      .isLength({ min: 3, max: 500 })
      .withMessage("La description doit comporter entre 3 et 500 caractères"),
    processController.createProcess
  );

router
  .route("/get_process_steps/:id")
  .get(protect, processController.getProcessSteps);

router
  .route("/delete_process/:id")
  .delete(protect, processController.deleteProcess);

router.route("/edit_process/:id").patch(
  protect,
  body("description")
    .trim()
    .escape()
    .custom((value) => {
      if (value.length > 500 || value.length < 3) {
        throw new Error(
          "Si vous modifiez la description, la nouvelle description doit comporter entre 3 et 500 caractères"
        );
      } else {
        return true;
      }
    }),
  body("title")
    .trim()
    .escape()
    .custom((value) => {
      if (value.length > 140 || value.length < 3) {
        throw new Error(
          "Si vous modifiez le titre, le nouveau titre doit comporter entre 3 et 140 caractères"
        );
      } else {
        return true;
      }
    }),
  processController.editProcess
);

router
  .route("/get_all_processes")
  .get(protect, processController.getAllUserProcesses);

router
  .route("/new_step/:id")
  .post(
    protect,
    body("content")
      .trim()
      .escape()
      .isLength({ min: 3, max: 500 })
      .withMessage(
        "Le contenu est nécessaire et doit comporter entre 3 et 500 caractères"
      ),
    processController.createStep
  );

router.route("/delete_step/:id").delete(protect, processController.deleteStep);

router
  .route("/edit_step/:id")
  .patch(
    protect,
    body("content")
      .trim()
      .escape()
      .isLength({ min: 3, max: 500 })
      .withMessage(
        "Le contenu est nécessaire et doit comporter entre 3 et 500 caractères"
      ),
    processController.editStep
  );

router
  .route("/add_to_collection")
  .patch(protect, processController.addProcessToCollection);

router
  .route("/remove_from_collection")
  .patch(protect, processController.removeFromCollection);

module.exports = router;
