const router = require("express").Router();
const taskController = require("../controllers/taskController");

const { body } = require("express-validator");

const { protect } = require("../middlewares/auth");

router
  .route("/new_task_simple")
  .post(
    protect,
    body("content")
      .trim()
      .escape()
      .isLength({ min: 3, max: 280 })
      .withMessage(
        "Le contenu de la tâche doit être compris entre 3 et 280 caractères"
      ),
    taskController.createSimpleTask
  );

router.route("/finish_task/:id").patch(protect, taskController.finishTask);

router.route("/unfinish_task/:id").patch(protect, taskController.unfinishTask);

router.route("/get_task/:id").get(protect, taskController.getTaskSimple);

router
  .route("/get_task_complete/:id")
  .get(protect, taskController.getTaskAndSubtasks);

router.route("/get_subtasks/:id").get(protect, taskController.loadSubtasks);

router.route("/get_all_tasks/").get(protect, taskController.getAllUserTasks);

router
  .route("/finish_subtask/:id")
  .patch(protect, taskController.finishSubtask);

router
  .route("/unfinish_subtask/:id")
  .patch(protect, taskController.unfinishSubtask);

router
  .route("/edit_task_simple/:id")
  .patch(
    protect,
    body("content")
      .trim()
      .escape()
      .isLength({ min: 3, max: 280 })
      .withMessage(
        "Le contenu de la tâche doit être compris entre 3 et 280 caractères"
      ),
    taskController.updateTaskSimple
  );

router
  .route("/edit_subtask/:id")
  .patch(
    protect,
    body("content")
      .trim()
      .escape()
      .isLength({ min: 3, max: 280 })
      .withMessage(
        "Le contenu de la sous-tâche doit être compris entre 3 et 280 caractères"
      ),
    taskController.updateSubtask
  );

router
  .route("/add_subtask_to_task/:id")
  .post(
    protect,
    body("content")
      .trim()
      .escape()
      .isLength({ min: 3, max: 280 })
      .withMessage(
        "Le contenu de la sous-tâche doit être compris entre 3 et 280 caractères"
      ),
    taskController.createSubtask
  );

router
  .route("/delete_subtask/:id")
  .delete(protect, taskController.deleteSubtask);

router.route("/delete_task/:id").delete(protect, taskController.deleteTask);

router
  .route("/add_to_collection")
  .patch(protect, taskController.addTaskToCollection);

router
  .route("/remove_from_collection")
  .patch(protect, taskController.removeFromCollection);

module.exports = router;
