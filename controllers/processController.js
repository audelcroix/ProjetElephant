const Process = require("../models/Process");
const Step = require("../models/Step");
const Collection = require("../models/Collection");
const User = require("../models/User");

const { handleMongooseDocCreationError } = require("./../utils/utils");

const { validationResult } = require("express-validator");

exports.createProcess = async (req, res) => {
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

    const newProcess = new Process({ title, description, user: req.user });

    newProcess.save((err, newProcess) => {
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

      return res
        .status(200)
        .json({ msg: "Processus créé avec succès", newProcess });
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

exports.getProcessSteps = async (req, res) => {
  try {
    const processToGetId = req.params.id;

    const targetProcess = await Process.findById(processToGetId)
      .populate("steps")
      .populate("collections");

    if (!targetProcess) {
      throw { error_msg: "Ce processus est introuvable" };
    }

    if (targetProcess.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de consulter ce processus",
      };
    }

    res.status(200).json({ msg: "test", targetProcess });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement de ce processus",
        ],
      });
    } else {
      res.status(401).json({ error_msg });
    }
  }
};

exports.deleteProcess = async (req, res) => {
  try {
    const processToDeleteId = req.params.id;

    const targetProcess = await Process.findById(processToDeleteId);

    if (!targetProcess) {
      throw { error_msg: "Ce processus est introuvable" };
    }

    if (targetProcess.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de supprimer ce processus",
      };
    }

    // delete from collections
    let updatedCollections = [];

    if (targetProcess.collections.length > 0) {
      const collectionsToUpdate = await Collection.find({
        _id: { $in: targetProcess.collections },
      });

      collectionsToUpdate.forEach((collection) => {
        Collection.findByIdAndUpdate(
          collection.id,
          {
            processes: collection.processes.filter(
              (id) => id != processToDeleteId
            ),
          },
          { new: true },
          (err, updatedCollection) => {
            if (err)
              throw {
                error_msg:
                  "Une erreur inattendue s'est produite lors de la mise à jour des collections contenant ce processus",
              };

            updatedCollections.push(updatedCollection);
          }
        );
      });
    }

    await Step.deleteMany({ process: processToDeleteId });

    Process.findByIdAndRemove(processToDeleteId, (err, deletedProcess) => {
      if (err) {
        throw {
          error_msg:
            "Une erreur inattendue s'est produite lors de la suppression de ce processus",
        };
      } else {
        return res
          .status(200)
          .json({ msg: "Processus supprimé", deletedProcess });
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
          "Oops! Une erreur interne est survenue lors de la suppression de ce processus",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.editProcess = async (req, res) => {
  try {
    const { description, title } = req.body;
    const processToGetId = req.params.id;

    const targetProcess = await Process.findById(processToGetId);

    if (!targetProcess) {
      throw { error_msg: "Ce processus est introuvable" };
    }

    if (targetProcess.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier ce processus",
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

    Process.findByIdAndUpdate(
      processToGetId,
      { description, title },
      { new: true },
      (err, updatedProcess) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["description", "title"],
            "Oops! Une erreur interne est survenue lors de la mise à jour de ce processus"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        } else {
          return res
            .status(200)
            .json({ msg: "Processus mis à jour", updatedProcess });
        }
      }
    );
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["description", "title"],
      "Oops! Une erreur interne est survenue lors de la mise à jour de ce processus"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

// Load Processes with steps and collections
exports.getAllUserProcesses = async (req, res) => {
  try {
    const userToFindProcesses = req.user.id;

    Process.find({ user: userToFindProcesses })
      .populate("collections")
      .populate("steps")
      .then((docs) => {
        res.status(200).json({
          msg:
            docs.length > 0
              ? "Processus chargés"
              : "Vous n'avez aucun processus enregistré pour l'instant",
          processes: docs,
        });
      });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement de vos processus",
        ],
      });
    } else {
      res.status(401).json({ error_msg });
    }
  }
};

exports.createStep = async (req, res) => {
  try {
    const targetMotherProcessId = req.params.id;
    const { content } = req.body;

    const motherProcess = await Process.findById(targetMotherProcessId);

    if (!motherProcess) {
      throw { error_msg: "Ce processus est introuvable" };
    }

    if (motherProcess.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier ce processus",
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

    const newStep = new Step({
      content,
      user: req.user,
      process: motherProcess,
    });

    await newStep.save();

    Process.findByIdAndUpdate(
      targetMotherProcessId,
      {
        steps: [...motherProcess.steps, newStep],
      },
      { new: true },
      (err, updatedProcess) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["description", "title"],
            "Oops! Une erreur interne est survenue lors de la création de la nouvelle étape"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        } else {
          return res
            .status(200)
            .json({ msg: "Nouvelle étape ajoutée", updatedProcess, newStep });
        }
      }
    );
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["content", "title"],
      "Oops! Une erreur interne est survenue lors de la création de la nouvelle étape"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.deleteStep = async (req, res) => {
  try {
    const stepToDeleteId = req.params.id;

    const targetStep = await Step.findById(stepToDeleteId);

    if (!targetStep) {
      throw { error_msg: "Cette étape est introuvable" };
    }

    if (targetStep.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de supprimer cette étape",
      };
    }

    Step.findByIdAndRemove(stepToDeleteId, (err, deletedStep) => {
      if (err) {
        throw {
          error_msg:
            "Une erreur inattendue s'est produite lors de la suppression de cette étape",
        };
      } else {
        return res.status(200).json({ msg: "Étape supprimée", deletedStep });
      }
    });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la suppression de cette étape",
        ],
      });
    } else {
      res.status(401).json({ error_msg });
    }
  }
};

exports.editStep = async (req, res) => {
  try {
    const targetStepId = req.params.id;
    const { content } = req.body;

    const targetStep = await Step.findById(targetStepId);

    if (!targetStep) {
      throw { error_msg: "Cette étape est introuvable" };
    }

    if (targetStep.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette étape",
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

    Step.findByIdAndUpdate(
      targetStepId,
      { content },
      { new: true },
      (err, updatedStep) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["content"],
            "Oops! Une erreur interne est survenue lors de la mise à jour de cette étape"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        } else {
          res.status(200).json({ msg: "Étape mise à jour", updatedStep });
        }
      }
    );
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["content"],
      "Oops! Une erreur interne est survenue lors de la mise à jour de cette étape"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.addProcessToCollection = async (req, res) => {
  try {
    const { processId, collectionId } = req.body;
    const userToGetprocessesId = req.user.id;

    // process and collection ids must exist in the post body
    if (!processId) {
      throw { error_msg: "Aucun processus précisé" };
    }

    if (!collectionId) {
      throw { error_msg: "Aucune collection précisée" };
    }

    // check user, process and collection exist in the database
    const userToGetProcesses = await User.findById(userToGetprocessesId);

    if (!userToGetProcesses) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    const collectionToUpdate = await Collection.findById(collectionId);

    if (!collectionToUpdate) {
      throw { error_msg: "Cette collection n'existe pas" };
    }

    const processToAddToCollection = await Process.findById(processId);

    if (!processToAddToCollection) {
      throw { error_msg: "Ce processus n'existe pas" };
    }

    // check process is not already in collection
    if (collectionToUpdate.processes.includes(processToAddToCollection.id)) {
      throw { error_msg: "Cette collection contient déjà ce processus" };
    }

    // update the documents
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      {
        processes: [...collectionToUpdate.processes, processToAddToCollection],
      },
      { new: true }
    );

    const updatedProcess = await Process.findByIdAndUpdate(
      processId,
      {
        collections: [
          ...processToAddToCollection.collections,
          collectionToUpdate,
        ],
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Processus ajouté à la collection",
      updatedProcess,
      updatedCollection,
    });
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      [],
      "Oops! Une erreur interne est survenue lors de l'ajout à la collection"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.removeFromCollection = async (req, res) => {
  try {
    const { processId, collectionId } = req.body;
    const userToGetprocessesId = req.user.id;

    // process and collection ids must exist in the post body
    if (!processId) {
      throw { error_msg: "Aucun processus précisé" };
    }

    if (!collectionId) {
      throw { error_msg: "Aucune collection précisée" };
    }

    // check user, process and collection exist in the database
    const userToGetProcesses = await User.findById(userToGetprocessesId);

    if (!userToGetProcesses) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    const collectionToUpdate = await Collection.findById(collectionId);

    if (!collectionToUpdate) {
      throw { error_msg: "Cette collection n'existe pas" };
    }

    const processToRemoveFromCollection = await Process.findById(processId);

    if (!processToRemoveFromCollection) {
      throw { error_msg: "Cette process n'existe pas" };
    }

    // update the documents
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      {
        processes: collectionToUpdate.processes.filter((id) => id != processId),
      },
      { new: true }
    );

    const updatedProcess = await Process.findByIdAndUpdate(
      processId,
      {
        collections: processToRemoveFromCollection.collections.filter(
          (id) => id != collectionId
        ),
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Processus retiré de la collection",
      updatedProcess,
      updatedCollection,
    });
  } catch (err) {
    let errorToReturn = handleMongooseDocCreationError(
      err,
      [],
      "Oops! Une erreur interne est survenue lors du retrait de ce processus de la collection"
    );

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};
