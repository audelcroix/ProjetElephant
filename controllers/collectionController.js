const Collection = require("./../models/Collection");
const User = require("./../models/User");
const Task = require("./../models/Task");
const Process = require("./../models/Process");
const Note = require("./../models/Note");

const { handleMongooseDocCreationError } = require("./../utils/utils");

const { validationResult } = require("express-validator");

exports.createCollection = async (req, res) => {
  try {
    const { description, title } = req.body;

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    const newCollection = new Collection({
      user: req.user,
      title,
      ...(description && { description }),
    });

    newCollection.save((err, newCollection) => {
      if (err) {
        let errorToReturn = handleMongooseDocCreationError(
          err,
          ["description", "title", "user"],
          "Oops! Une erreur interne est survenue lors de la création de la nouvelle collection"
        );

        return res
          .status(errorToReturn.code)
          .json({ error_msg: errorToReturn.error_msg });
      }

      return res
        .status(200)
        .json({ msg: "Nouvelle collection ajoutée", newCollection });
    });
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["description", "title", "user"],
      "Oops! Une erreur interne est survenue lors de la création du nouveau processus"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const collectionToDeleteId = req.params.collectionId;

    const collectionToDelete = await Collection.findById(collectionToDeleteId);

    if (!collectionToDelete) {
      throw { error_msg: "Cette collection est introuvable" };
    }

    if (collectionToDelete.user != req.user.id) {
      throw {
        error_msg:
          "Vous n'avez pas l'autorisation de supprimer cette collection",
      };
    }

    // REMOVE COLLECTION FROM REFERENCED DOCUMENTS

    let updatedTasks = [];
    let updatedNotes = [];
    let updatedProcesses = [];

    // Delete from TASKS
    if (collectionToDelete.tasks.length > 0) {
      const tasksToUpdate = await Task.find({
        _id: { $in: collectionToDelete.tasks },
      });

      tasksToUpdate.forEach((task) => {
        Task.findByIdAndUpdate(
          task.id,
          {
            collections: task.collections.filter(
              (id) => id != collectionToDeleteId
            ),
          },
          { new: true },
          (err, updatedTask) => {
            if (err)
              throw {
                error_msg:
                  "Une erreur inattendue s'est produite lors de la mise à jour des tâches appartenant à cette collection",
              };

            updatedTasks.push(updatedTask);
          }
        );
      });
    }

    // Delete from NOTES
    if (collectionToDelete.notes.length > 0) {
      const notesToUpdate = await Note.find({
        _id: { $in: collectionToDelete.notes },
      });

      notesToUpdate.forEach((note) => {
        Note.findByIdAndUpdate(
          note.id,
          {
            collections: note.collections.filter(
              (id) => id != collectionToDeleteId
            ),
          },
          { new: true },
          (err, updatedNote) => {
            if (err)
              throw {
                error_msg:
                  "Une erreur inattendue s'est produite lors de la mise à jour des notes appartenant à cette collection",
              };

            updatedNotes.push(updatedNote);
          }
        );
      });
    }

    // Delete from PROCESSES
    if (collectionToDelete.processes.length > 0) {
      const processesToUpdate = await Process.find({
        _id: { $in: collectionToDelete.processes },
      });

      processesToUpdate.forEach((process) => {
        Process.findByIdAndUpdate(
          process.id,
          {
            collections: process.collections.filter(
              (id) => id != collectionToDeleteId
            ),
          },
          { new: true },
          (err, updatedProcess) => {
            if (err)
              throw {
                error_msg:
                  "Une erreur inattendue s'est produite lors de la mise à jour des notes appartenant à cette collection",
              };

            updatedProcesses.push(updatedProcess);
          }
        );
      });
    }

    // DELETE COLLECTION ITSELF
    Collection.findByIdAndRemove(
      collectionToDeleteId,
      (err, removedCollection) => {
        if (err) {
          throw {
            error_msg:
              "Une erreur inattendue s'est produite lors de la suppression de cette collection",
          };
        } else {
          return res
            .status(200)
            .json({ msg: "Collection supprimée", removedCollection });
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
          "Oops! Une erreur interne est survenue lors de la suppression de la collection",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.editCollection = async (req, res) => {
  try {
    const targetCollectionId = req.params.collectionId;
    const { title, description } = req.body;

    // check if Collection exists and user is allowed to update it
    const targetCollection = await Collection.findById(targetCollectionId);

    if (!targetCollection) {
      throw { error_msg: "Cette collection est introuvable" };
    }

    if (targetCollection.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette collection",
      };
    }

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    Collection.findByIdAndUpdate(
      targetCollectionId,
      { title, description },
      { new: true },
      (err, updatedCollection) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["description", "title"],
            "Oops! Une erreur interne est survenue lors de la mise à jour de cette collection"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        } else {
          return res
            .status(200)
            .json({ msg: "Collection mise à jour", updatedCollection });
        }
      }
    );
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["description", "title"],
      "Oops! Une erreur interne est survenue lors de la mise à jour de cette collection"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.getCollectionComplete = async (req, res) => {
  try {
    const targetCollectionId = req.params.collectionId;

    const collectionRes = await Collection.findById(targetCollectionId)
      .populate("notes")
      .populate({
        path: "tasks",
        populate: {
          path: "subtasks",
        },
      })
      .populate({
        path: "processes",
        populate: {
          path: "steps",
        },
      });

    return res.status(200).json({
      msg: "Vos collections ont été chargées avec succès",
      collectionComplete: collectionRes,
    });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement des collections",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.getUserCollection = async (req, res) => {
  try {
    const userToGetCollectionsId = req.user.id;

    const userToLoadCollections = await User.findById(userToGetCollectionsId);

    if (!userToLoadCollections) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    Collection.find({ user: userToGetCollectionsId }, (err, docs) => {
      if (err) {
        return res.status(500).json({
          error_msg:
            "Oops, une erreur interne est survenue lors du chargement de vos collections",
        });
      }

      return res.status(200).json({
        msg:
          docs.length > 0
            ? "Vos collections ont été chargées avec succès"
            : "Vous n'avez encore aucune collection",
        collections: docs,
      });
    });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement des collections",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};
