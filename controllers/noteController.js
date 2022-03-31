const Note = require("./../models/Note");
const Collection = require("./../models/Collection");
const User = require("./../models/User");

const { validationResult } = require("express-validator");

const { handleMongooseDocCreationError } = require("./../utils/utils");

exports.createNote = async (req, res) => {
  try {
    const { content } = req.body;

    // Check if content is valid
    /* if (!content || content.length < 3 || content.length > 300) {
      throw {
        error_msg:
          "Le contenu d'une note doit être compris entre 3 et 300 caractères",
      };
    } */

    let errors = validationResult(req);
    console.log("HERE!!!");
    if (!errors.isEmpty()) {
      console.log("HERE ERR!!!");

      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }
    console.log("HERE!!!");

    const newNote = new Note({ content, user: req.user });
    console.log("HERE!!!");
    console.log(newNote);

    newNote.save((err, newNote) => {
      if (err) {
        console.log("HERE ERR 2!!!");

        let errorToReturn = handleMongooseDocCreationError(
          err,
          ["content", "user"],
          "Oops! Une erreur interne est survenue lors de la création de la nouvelle note"
        );

        return res
          .status(errorToReturn.code)
          .json({ error_msg: errorToReturn.error_msg });
      }

      console.log("HERE F!!!");

      return res.status(200).json({ msg: "Nouvelle note ajoutée", newNote });
    });
  } catch (err) {
    console.log(err);
    let errorToReturn = handleMongooseDocCreationError(
      err,
      ["content", "user"],
      "Oops! Une erreur interne est survenue lors de la création de la nouvelle note"
    );

    console.log("HERE ERR F!!!");

    return res
      .status(errorToReturn.code)
      .json({ error_msg: errorToReturn.error_msg });
  }
};

exports.getNote = async (req, res) => {
  try {
    const noteToGetId = req.params.id;

    const noteToGet = await Note.findById(noteToGetId).populate(
      "collections",
      "_id title"
    );

    if (!noteToGet) {
      throw { error_msg: "Cette note est introuvable" };
    }

    if (noteToGet.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de consulter cette note",
      };
    }

    res.status(200).json({ msg: "Note chargée avec succès", note: noteToGet });
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors du chargement de la note",
        ],
      });
    } else {
      res.status(401).json({ error_msg });
    }
  }
};

exports.editNote = async (req, res) => {
  try {
    const noteToEditId = req.params.id;

    const { content } = req.body;

    const noteToEdit = await Note.findById(noteToEditId);

    if (!noteToEdit) {
      throw { error_msg: "Cette note est introuvable" };
    }

    if (noteToEdit.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de modifier cette note",
      };
    }

    // Check if content is valid
    /* if (!content || content.length < 3 || content.length > 300) {
      throw {
        error_msg:
          "Le contenu d'une note doit être compris entre 3 et 300 caractères",
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

    Note.findByIdAndUpdate(
      noteToEditId,
      { content },
      { new: true },
      (err, updatedNote) => {
        if (err) {
          let errorToReturn = handleMongooseDocCreationError(
            err,
            ["content", "user"],
            "Oops! Une erreur interne est survenue lors de la mise à jour de la note"
          );

          return res
            .status(errorToReturn.code)
            .json({ error_msg: errorToReturn.error_msg });
        }

        return res
          .status(200)
          .json({ msg: "Note mise à jour avec succès", note: updatedNote });
      }
    );
  } catch (err) {
    let error_msg = [];

    if (err.error_msg) {
      error_msg.push(err.error_msg);
    }

    if (error_msg.length < 1) {
      res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne est survenue lors de la création de la nouvelle note",
        ],
      });
    } else {
      res.status(401).json({ error_msg });
    }
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteToDeleteId = req.params.id;

    const noteToDelete = await Note.findById(noteToDeleteId);

    if (!noteToDelete) {
      throw { error_msg: "Cette note est introuvable" };
    }

    if (noteToDelete.user != req.user.id) {
      throw {
        error_msg: "Vous n'avez pas la permission de supprimer cette note",
      };
    }

    // delete from collections
    let updatedCollections = [];

    if (noteToDelete.collections.length > 0) {
      const collectionsToUpdate = await Collection.find({
        _id: { $in: noteToDelete.collections },
      });

      collectionsToUpdate.forEach((collection) => {
        Collection.findByIdAndUpdate(
          collection.id,
          { notes: collection.notes.filter((id) => id != noteToDeleteId) },
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

    Note.findByIdAndDelete(noteToDeleteId, (err, removedNote) => {
      if (err) {
        let errorToReturn = handleMongooseDocCreationError(
          err,
          ["user"],
          "Oops! Une erreur interne est survenue lors de la création de la suppression de la note"
        );

        return res
          .status(errorToReturn.code)
          .json({ error_msg: errorToReturn.error_msg });
      }

      return res.status(200).json({
        msg: "Note supprimée",
        removedNote,
        ...(updatedCollections.length > 0 && { updatedCollections }),
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
          "Oops! Une erreur interne est survenue lors de la suppression de la note",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};

exports.testnotes = async (req, res) => {
  console.log("HERE!!!");
  return res.status(200).json({ notes: [], msg: "GRUDU get!!" });
};

exports.testpost = async (req, res) => {
  console.log("HERE!!!");
  return res.status(200).json({ notes: [], msg: "GRUDU post!!" });
};

// Si il y a une page notedetail, il faudra retirer le populate des collections
exports.getAllUserNotes = async (req, res) => {
  console.log("HERE!!! I BEGIN");

  try {
    console.log(req.user.id);
    const userToGetNotesId = req.user.id;

    const userToGetNotes = await User.findById(userToGetNotesId);

    if (!userToGetNotes) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    Note.find({ user: userToGetNotesId })
      .populate("collections")
      .then((docs, err) => {
        if (err) {
          return res.status(500).json({
            error_msg:
              "Oops, une erreur interne est survenue lors du chargement de vos notes",
          });
        }

        return res.status(200).json({
          msg:
            docs.length > 0
              ? "Vos notes ont été chargées avec succès"
              : "Vous n'avez encore aucune note",
          notes: docs,
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
          "Oops! Une erreur interne est survenue lors du chargement de vos notes",
        ],
      });
    } else {
      res.status(401).json({ error_msg });
    }
  }
};

exports.addNoteToCollection = async (req, res) => {
  try {
    const { noteId, collectionId } = req.body;
    const userToGetNotesId = req.user.id;

    // note and collection ids must exist in the post body
    if (!noteId) {
      throw { error_msg: "Aucune note précisée" };
    }

    if (!collectionId) {
      throw { error_msg: "Aucune collection précisée" };
    }

    // check user, note and collection exist in the database
    const userToGetNotes = await User.findById(userToGetNotesId);

    if (!userToGetNotes) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    const collectionToUpdate = await Collection.findById(collectionId);

    if (!collectionToUpdate) {
      throw { error_msg: "Cette collection n'existe pas" };
    }

    const noteToAddToCollection = await Note.findById(noteId);

    if (!noteToAddToCollection) {
      throw { error_msg: "Cette note n'existe pas" };
    }

    // check note is not already in collection
    if (collectionToUpdate.notes.includes(noteToAddToCollection.id)) {
      throw { error_msg: "Cette collection contient déjà cette note" };
    }

    // update the documents
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { notes: [...collectionToUpdate.notes, noteToAddToCollection] },
      { new: true }
    );

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        collections: [...noteToAddToCollection.collections, collectionToUpdate],
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Note ajoutée à la collection",
      updatedNote,
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

exports.removeNoteFromCollection = async (req, res) => {
  try {
    const { noteId, collectionId } = req.body;
    const userToGetNotesId = req.user.id;

    // note and collection ids must exist in the post body
    if (!noteId) {
      throw { error_msg: "Aucune note précisée" };
    }

    if (!collectionId) {
      throw { error_msg: "Aucune collection précisée" };
    }

    // check user, note and collection exist in the database
    const userToGetNotes = await User.findById(userToGetNotesId);

    if (!userToGetNotes) {
      throw { error_msg: "Cet utilisateur n'existe pas" };
    }

    const collectionToUpdate = await Collection.findById(collectionId);

    if (!collectionToUpdate) {
      throw { error_msg: "Cette collection n'existe pas" };
    }

    const noteToRemoveFromCollection = await Note.findById(noteId);

    if (!noteToRemoveFromCollection) {
      throw { error_msg: "Cette note n'existe pas" };
    }

    // update the documents
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { notes: collectionToUpdate.notes.filter((id) => id != noteId) },
      { new: true }
    );

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        collections: noteToRemoveFromCollection.collections.filter(
          (id) => id != collectionId
        ),
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Note retirée de la collection",
      updatedNote,
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
          "Oops! Une erreur interne est survenue lors du retrait de cette note de la collection",
        ],
      });
    } else {
      return res.status(401).json({ error_msg });
    }
  }
};
