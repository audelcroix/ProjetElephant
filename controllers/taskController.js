const Task = require("../models/Task");
const Subtask = require("../models/Subtask");
const User = require("../models/User");
const Collection = require("../models/Collection");

const { handleMongooseDocCreationError } = require("./../utils/utils");

const { validationResult } = require("express-validator");

exports.createSimpleTask = async (req, res) => {
  try {
    const { content, limitDate } = req.body;

    // Validate the date. Date must be in the past and valid
    if (limitDate) {
      const translatedLimitDate = new Date(limitDate).getTime();
      const isInvalidDate = Number.isNaN(translatedLimitDate);

      if (isInvalidDate) {
        throw { error_msg: "Cette date est invalide" };
      }

      if (translatedLimitDate < Date.now()) {
        throw { error_msg: "La date doit être dans le futur" };
      }
    }

    // Date is validated

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    const newTask = new Task({
      content,
      user: req.user,
      ...(limitDate && { limitDate }),
    });

    newTask.save((err, newTask) => {
      if (err) {
        let errorToReturn = handleMongooseDocCreationError(
          err,
          ["description", "title", "user"],
          "Oops! Une erreur interne est survenue lors de la création du nouveau processus"
        );

        return res
          .status(errorToReturn.code)
          .json({ error_msg: errorToReturn.error_msg });
      }

      return res.status(200).json({ msg: "Nouvelle tâche ajoutée", newTask });
    });
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["limitDate", "content", "user"],
      "Oops! Une erreur interne est survenue lors de la création de la nouvelle tâche"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.createSubtask = async (req, res) => {
  try {
    const targetMotherTaskId = req.params.id;
    const { content, limitDate } = req.body;

    // check the mother task exists
    const motherTask = await Task.findById(targetMotherTaskId);

    if (!motherTask) {
      throw { error_msg: "Cette tâche est introuvable" };
    }
    // check the user is allowed to edit the task
    if (motherTask.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette tâche",
      };
    }

    if (motherTask.isDone === true) {
      throw { error_msg: "Impossible de modifier une tâche terminée" };
    }

    // validate the content of the subtask
    // Validate the date. Date must be in the past and valid
    if (limitDate) {
      const translatedLimitDate = new Date(limitDate).getTime();
      const isInvalidDate = Number.isNaN(translatedLimitDate);

      if (isInvalidDate) {
        throw { error_msg: "Cette date est invalide" };
      }

      if (translatedLimitDate < Date.now()) {
        throw { error_msg: "La date doit être dans le futur" };
      }
    }

    // Date is validated

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    const newSubTask = new Subtask({
      content,
      user: req.user,
      task: motherTask,
      ...(limitDate && { limitDate }),
    });

    // create the subtask
    await newSubTask.save();

    // update the mother task

    Task.findByIdAndUpdate(
      targetMotherTaskId,
      { isCompositeTask: true, subtasks: [...motherTask.subtasks, newSubTask] },
      { new: true },
      (err) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["description", "title"],
            "Oops! Une erreur interne est survenue lors de la mise à jour de cette tâche"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        } else {
          return res
            .status(200)
            .json({ msg: "Nouvelle sous-tâche ajoutée", newSubTask });
        }
      }
    );
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la création de cette sous-tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.finishTask = async (req, res) => {
  try {
    const targetTaskId = req.params.id;

    const targetTask = await Task.findById(targetTaskId);

    if (!targetTask) {
      throw { error_msg: "Cette tâche est introuvable" };
    }

    if (targetTask.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette tâche",
      };
    }

    if (targetTask.isDone === true) {
      throw { error_msg: "Cette tâche est déjà terminée" };
    }

    Task.findByIdAndUpdate(
      targetTaskId,
      { isDone: true },
      { new: true },
      (err, finishedTask) => {
        if (err) {
          throw {
            error_msg:
              "Une erreur inattendue s'est produite lors de la finalisation de cette tâche",
          };
        } else {
          return res.status(200).json({ msg: "Tâche terminée", finishedTask });
        }
      }
    );
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la finalisation de cette tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.unfinishTask = async (req, res) => {
  try {
    const targetTaskId = req.params.id;

    const targetTask = await Task.findById(targetTaskId);

    if (!targetTask) {
      throw { error_msg: "Cette tâche est introuvable" };
    }

    if (targetTask.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette tâche",
      };
    }

    if (!targetTask.isDone === true) {
      throw { error_msg: "Cette tâche n'est pas terminée" };
    }

    Task.findByIdAndUpdate(
      targetTaskId,
      { isDone: false },
      { new: true },
      (err, unfinishedTask) => {
        if (err) {
          throw {
            error_msg:
              "Une erreur inattendue s'est produite lors de la définalisation de cette tâche de cette tâche",
          };
        } else {
          return res
            .status(200)
            .json({ msg: "Tâche mise à jour", unfinishedTask });
        }
      }
    );
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la définalisation de cette tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.finishSubtask = async (req, res) => {
  try {
    const targetSubtaskId = req.params.id;

    const targetSubtask = await Subtask.findById(targetSubtaskId);

    if (!targetSubtask) {
      throw { error_msg: "Cette sous-tâche est introuvable" };
    }

    if (targetSubtask.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette sous-tâche",
      };
    }

    if (targetSubtask.isDone === true) {
      throw { error_msg: "Cette sous-tâche est déjà terminée" };
    }

    Subtask.findByIdAndUpdate(
      targetSubtaskId,
      { isDone: true },
      { new: true },
      (err, finishedSubtask) => {
        if (err) {
          throw {
            error_msg:
              "Une erreur inattendue s'est produite lors de la finalisation de cette tâche",
          };
        } else {
          return res
            .status(200)
            .json({ msg: "Sous-tâche terminée", finishedSubtask });
        }
      }
    );
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la finalisation de cette sous-tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.unfinishSubtask = async (req, res) => {
  try {
    const targetSubtaskId = req.params.id;

    const targetSubtask = await Subtask.findById(targetSubtaskId);

    if (!targetSubtask) {
      throw { error_msg: "Cette sous-tâche est introuvable" };
    }

    if (targetSubtask.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette sous-tâche",
      };
    }

    if (targetSubtask.isDone === false) {
      throw { error_msg: "Cette sous-tâche n'est pas encore terminée" };
    }

    Subtask.findByIdAndUpdate(
      targetSubtaskId,
      { isDone: false },
      { new: true },
      (err, unfinishedSubtask) => {
        if (err) {
          throw {
            error_msg:
              "Une erreur inattendue s'est produite lors de la définalisation de cette tâche de cette tâche",
          };
        } else {
          return res
            .status(200)
            .json({ msg: "Sous-tâche mise à jour", unfinishedSubtask });
        }
      }
    );
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la définalisation de cette sous-tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.updateTaskSimple = async (req, res) => {
  try {
    const targetTaskId = req.params.id;
    const { content, limitDate } = req.body;

    // check if task exists and user is allowed to update it
    const targetTask = await Task.findById(targetTaskId);

    if (!targetTask) {
      throw { error_msg: "Cette tâche est introuvable" };
    }

    if (targetTask.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette tâche",
      };
    }

    if (targetTask.isDone === true) {
      throw { error_msg: "Impossible de modifier une tâche terminée" };
    }

    // Check if content is valid
    /* if (!content || content.length < 3 || content.length > 280) {
      throw {
        error_msg:
          "Le contenu d'une tâche doit être compris entre 3 et 280 caractères",
      };
    } */

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    // Validate the date. Date must be in the past and valid
    const translatedLimitDate = new Date(limitDate).getTime();
    const isInvalidDate = Number.isNaN(translatedLimitDate);

    if (isInvalidDate) {
      throw { error_msg: "Cette date est invalide" };
    }

    if (translatedLimitDate < Date.now()) {
      throw { error_msg: "La date doit être dans le futur" };
    }

    Task.findByIdAndUpdate(
      targetTaskId,
      { content, limitDate },
      { new: true },
      (err, updatedTask) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["limitDate", "user", "content"],
            "Oops! Une erreur interne est survenue lors de la mise à jour de cette tâche"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        } else {
          return res
            .status(200)
            .json({ msg: "Tâche mise à jour", updatedTask });
        }
      }
    );
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["limitDate", "user", "content"],
      "Oops! Une erreur interne est survenue lors de la mise à jour de cette tâche"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.updateSubtask = async (req, res) => {
  try {
    const targetSubtaskId = req.params.id;
    const { content, limitDate } = req.body;

    // check if subtask exists and user is allowed to update it
    const targetSubtask = await Subtask.findById(targetSubtaskId);

    if (!targetSubtask) {
      throw { error_msg: "Cette sous-tâche est introuvable" };
    }

    if (targetSubtask.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette sous-tâche",
      };
    }

    if (targetSubtask.isDone === true) {
      throw { error_msg: "Impossible de modifier une sous-tâche terminée" };
    }

    // Check if content is valid
    /* if (!content || content.length < 3 || content.length > 280) {
      throw {
        error_msg:
          "Le contenu d'une sous-tâche doit être compris entre 3 et 280 caractères",
      };
    } */

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    // PROTO
    if (limitDate) {
      // Validate the date. Date must be in the past and valid
      const translatedLimitDate = new Date(limitDate).getTime();
      const isInvalidDate = Number.isNaN(translatedLimitDate);

      if (isInvalidDate) {
        throw { error_msg: "Cette date est invalide" };
      }

      if (translatedLimitDate < Date.now()) {
        throw { error_msg: "La date doit être dans le futur" };
      }
    } else {
      let limitDate = null;
    }

    Subtask.findByIdAndUpdate(
      targetSubtaskId,
      { content, limitDate },
      { new: true },
      (err, updatedSubtask) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["description", "title"],
            "Oops! Une erreur interne est survenue lors de la mise à jour de cette sous-tâche"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        } else {
          return res
            .status(200)
            .json({ msg: "Sous-tâche mise à jour", updatedSubtask });
        }
      }
    );
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["description", "title"],
      "Oops! Une erreur interne est survenue lors de la mise à jour de cette tâche"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.deleteSubtask = async (req, res) => {
  try {
    const subtaskToDeleteId = req.params.id;

    const subtaskToDelete = await Subtask.findById(subtaskToDeleteId);

    if (!subtaskToDelete) {
      throw { error_msg: "Cette sous-tâche est introuvable" };
    }

    if (subtaskToDelete.user != req.user.id) {
      throw {
        error_msg:
          "Vous n'avez pas la permission de supprimer cette sous-tâche",
      };
    }

    const motherTask = await Task.findById(subtaskToDelete.task);

    await Subtask.findByIdAndDelete(subtaskToDeleteId);

    if (motherTask) {
      const updatedSubtasks = motherTask.subtasks.filter(
        (id) => id != subtaskToDeleteId
      );

      Task.findByIdAndUpdate(
        subtaskToDelete.task,
        {
          subtasks: updatedSubtasks,
          ...(updatedSubtasks.length === 0 && { isCompositeTask: false }),
        },
        { new: true },
        (err, updatedMotherTask) => {
          if (err) {
            throw {
              error_msg:
                "Une erreur inattendue s'est produite lors de la suppression de cette sous-tâche",
            };
          } else {
            return res.status(200).json({
              msg: "Sous-tâche supprimée et tâche mise à jour",
              updatedMotherTask,
            });
          }
        }
      );
    }
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la suppression de cette sous-tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskToDeleteId = req.params.id;

    const taskToDelete = await Task.findById(taskToDeleteId);

    if (!taskToDelete) {
      throw { error_msg: "Cette tâche est introuvable" };
    }

    if (taskToDelete.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de supprimer cette tâche",
      };
    }

    // delete from collections
    let updatedCollections = [];

    if (taskToDelete.collections.length > 0) {
      const collectionsToUpdate = await Collection.find({
        _id: { $in: taskToDelete.collections },
      });

      collectionsToUpdate.forEach((collection) => {
        Collection.findByIdAndUpdate(
          collection.id,
          { tasks: collection.tasks.filter((id) => id != taskToDeleteId) },
          { new: true },
          (err, updatedCollection) => {
            if (err)
              throw {
                error_msg:
                  "Une erreur inattendue s'est produite lors de la mise à jour des collections contenant cette note",
              };

            updatedCollections.push(updatedCollection);
          }
        );
      });
    }

    await Subtask.deleteMany({ task: taskToDeleteId });

    Task.findByIdAndDelete(taskToDeleteId, (err, removedTask) => {
      if (err) {
        throw {
          error_msg:
            "Une erreur inattendue s'est produite lors de la suppression de cette sous-tâche",
        };
      } else {
        return res.status(200).json({ msg: "Tâche supprimée", removedTask });
      }
    });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la suppression de cette tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

// INUTILISÉ
exports.getTaskSimple = async (req, res) => {
  try {
    const taskToGetId = req.params.id;

    const taskToGet = await Task.findById(taskToGetId);

    if (!taskToGet) {
      throw { error_msg: "Cette tâche est introuvable" };
    }

    if (taskToGet.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de consulter cette tâche",
      };
    }

    return res
      .status(200)
      .json({ task: taskToGet, msg: "Tâche chargée avec succès" });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement de cette tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.getTaskAndSubtasks = async (req, res) => {
  try {
    const taskToGetId = req.params.id;

    const taskToGet = await Task.findById(taskToGetId)
      .populate("subtasks")
      .populate({ path: "collections", select: "title id" });

    if (!taskToGet) {
      throw { error_msg: "Cette tâche est introuvable" };
    }

    if (taskToGet.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de consulter cette tâche",
      };
    }

    return res
      .status(200)
      .json({ task: taskToGet, msg: "Tâche chargée avec succès" });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement de cette tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.loadSubtasks = async (req, res) => {
  try {
    const taskToGetId = req.params.id;

    const taskToGet = await Task.findById(taskToGetId);

    if (!taskToGet) {
      throw { error_msg: "Cette tâche est introuvable" };
    }

    if (taskToGet.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de consulter ces sous-tâches",
      };
    }

    if (!taskToGet.isCompositeTask) {
      throw { error_msg: "Cette tâche n'a aucune sous-tâche associée" };
    }

    Subtask.find({ task: taskToGetId }, (err, loadedSubtasks) => {
      if (err) {
        return res.status(500).json({
          error_msg:
            "Oops, une erreur interne est survenue lors du chargement des sous-tâches associées à cette note",
        });
      }

      return res
        .status(200)
        .json({ msg: "Sous-tâches chargées avec succès", loadedSubtasks });
    });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement de cette tâche",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

// Also loads subtasks and collections
exports.getAllUserTasks = async (req, res) => {
  try {
    const userToGetTasksId = req.user.id;

    const userToLoadTasks = await User.findById(userToGetTasksId);

    if (!userToLoadTasks) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    Task.find({ user: userToGetTasksId })
      .populate("subtasks")
      .populate({ path: "collections", select: "title id" })
      .then((docs) => {
        return res.status(200).json({
          msg:
            docs.length > 0
              ? "Vos tâches ont été chargées avec succès"
              : "Vous n'avez encore aucune tâche",
          tasks: docs,
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement de vos tâches",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.addTaskToCollection = async (req, res) => {
  try {
    const { taskId, collectionId } = req.body;
    const userToGetTasksId = req.user.id;

    // task and collection ids must exist in the post body
    if (!taskId) {
      throw { error_msg: "Aucune tâche précisée" };
    }

    if (!collectionId) {
      throw { error_msg: "Aucune collection précisée" };
    }

    // check user, task and collection exist in the database
    const userToGetTasks = await User.findById(userToGetTasksId);

    if (!userToGetTasks) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    const collectionToUpdate = await Collection.findById(collectionId);

    if (!collectionToUpdate) {
      throw { error_msg: "Cette collection n'existe pas" };
    }

    const taskToAddToCollection = await Task.findById(taskId);

    if (!taskToAddToCollection) {
      throw { error_msg: "Cette tâche n'existe pas" };
    }

    // check task is not already in collection
    if (collectionToUpdate.tasks.includes(taskToAddToCollection.id)) {
      throw { error_msg: "Cette collection contient déjà cette tâche" };
    }

    // update the documents
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { tasks: [...collectionToUpdate.tasks, taskToAddToCollection] },
      { new: true }
    );

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        collections: [...taskToAddToCollection.collections, collectionToUpdate],
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Tâche ajoutée à la collection",
      updatedTask,
      updatedCollection,
    });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de l'ajout à la collection",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.removeFromCollection = async (req, res) => {
  try {
    const { taskId, collectionId } = req.body;
    const userToGetTasksId = req.user.id;

    // task and collection ids must exist in the post body
    if (!taskId) {
      throw { error_msg: "Aucune tâche précisée" };
    }

    if (!collectionId) {
      throw { error_msg: "Aucune collection précisée" };
    }

    // check user, task and collection exist in the database
    const userToGetTasks = await User.findById(userToGetTasksId);

    if (!userToGetTasks) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    const collectionToUpdate = await Collection.findById(collectionId);

    if (!collectionToUpdate) {
      throw { error_msg: "Cette collection n'existe pas" };
    }

    const taskToRemoveFromCollection = await Task.findById(taskId);

    if (!taskToRemoveFromCollection) {
      throw { error_msg: "Cette tâche n'existe pas" };
    }

    // update the documents
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { tasks: collectionToUpdate.tasks.filter((id) => id != taskId) },
      { new: true }
    );

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        collections: taskToRemoveFromCollection.collections.filter(
          (id) => id != collectionId
        ),
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Tâche retirée de la collection",
      updatedTask,
      updatedCollection,
    });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du retrait de cette tâche de la collection",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};
