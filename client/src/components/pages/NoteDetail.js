import React, { useState, useEffect, Fragment } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import {
  updateNote,
  deleteNote,
  setLoading,
  setErrorMsgs,
} from "./../../actions/userActions";

import AddToCollectionForm from "../parts/AddToCollectionForm";
import RemoveFromCollection from "../parts/RemoveFromCollection";
import MainLoading from "./../parts/MainLoading";
import ErrorMsgBoard from "../parts/ErrorMsgBoard";
import MessageBoard from "../parts/MessageBoard";

const NoteDetail = (props) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [localNote, setLocalNote] = useState(null);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updatedNoteContent, setUpdatedNoteContent] = useState();
  const [noteIsUpdating, setNoteIsUpdating] = useState(false);
  const [showAddToCollectionForm, setShowAddToCollectionForm] = useState(false);

  useEffect(() => {
    const getNote = async () => {
      try {
        dispatch(setLoading(true));

        const res = await axios.get(
          `http://localhost:5000/api/notes/get_note/${props.match.params.noteId}`
        );

        setLocalNote(res.data.note);
        setUpdatedNoteContent(res.data.note.content);

        dispatch(setLoading(false));
      } catch (err) {
        dispatch(
          setErrorMsgs(
            err.response && err.response.data.error_msg
              ? [err.response.data.error_msg]
              : [
                  "Oops! Une erreur inattendue s'est produite lors du chargement",
                ]
          )
        );

        props.history.push("/");
      }
    };

    getNote();
  }, []);

  const handleUpdatedContentChange = (event) => {
    setUpdatedNoteContent(event.target.value);
  };

  const handleNoteUpdate = async (event) => {
    event.preventDefault();

    // updateNote return a success status boolean to allow the local note to be updated
    let updateSuccessful = await dispatch(
      updateNote({
        content: updatedNoteContent,
        noteToUpdateId: localNote._id,
      })
    );

    updateSuccessful &&
      setLocalNote({ ...localNote, content: updatedNoteContent });

    setUpdatedNoteContent(localNote.content);

    setShowUpdateForm(false);
  };

  return (
    <div className='columns'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {localNote && !loading ? (
          <Fragment>
            <div className='block mt-5'>
              <Link to={"/"} className='has-text-weight-medium'>
                Retour aux Notes
              </Link>
            </div>

            <div className='columns my-0 py-0'>
              <div className='column is-half is-offset-one-quarter'>
                <MessageBoard />
                <ErrorMsgBoard />
              </div>
            </div>

            {showUpdateForm ? (
              <div className='block'>
                <form onSubmit={handleNoteUpdate}>
                  <div className='field'>
                    <label className='label'>Titre</label>

                    <p className='control'>
                      <textarea
                        className='textarea is-info'
                        name='content'
                        value={updatedNoteContent}
                        onChange={handleUpdatedContentChange}
                      ></textarea>
                    </p>
                  </div>

                  <div className='buttons'>
                    <button className='button is-small is-info' type='submit'>
                      Mettre à jour
                    </button>

                    <button
                      className='button is-small is-warning'
                      onClick={() => {
                        setShowUpdateForm(false);
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <Fragment>
                <div className='block'>
                  <div className='content'>
                    <p>{localNote.content}</p>
                  </div>
                </div>

                <div className='block'>
                  <div className='buttons'>
                    <button
                      className='button is-small is-warning'
                      onClick={() => {
                        setShowUpdateForm(true);
                      }}
                    >
                      Modifier
                    </button>

                    <button
                      className='button is-small is-danger'
                      onClick={() => {
                        dispatch(deleteNote(localNote._id));
                        props.history.push("/");
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </Fragment>
            )}

            <RemoveFromCollection
              origin={"notes"}
              targetDocumentId={localNote._id}
              currentCollections={localNote.collections}
              removeCollectionFromMotherProcess={(collectionObject) => {
                setLocalNote({
                  ...localNote,
                  collections: localNote.collections.filter((collection) => {
                    return collection._id != collectionObject._id;
                  }),
                });
              }}
            />

            {showAddToCollectionForm ? (
              <AddToCollectionForm
                origin={"notes"}
                targetDocumentId={localNote._id}
                addCollectionToMotherProcess={(collectionObject) => {
                  setLocalNote({
                    ...localNote,
                    collections: [...localNote.collections, collectionObject],
                  });
                }}
                closeAddToCollectionForm={() => {
                  setShowAddToCollectionForm(false);
                }}
              />
            ) : (
              <div className='block'>
                <button
                  className='button is-small is-info'
                  onClick={() => {
                    setShowAddToCollectionForm(true);
                  }}
                >
                  Ajouter à une collection
                </button>
              </div>
            )}
          </Fragment>
        ) : (
          <MainLoading />
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
