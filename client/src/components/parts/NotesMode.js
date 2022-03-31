import React, { Fragment, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useSelector, useDispatch } from "react-redux";
import {
  loadUserNotes,
  createNote,
  setErrorMsgs,
} from "./../../actions/userActions";
import IndividualNote from "./IndividualNote";
import PartialLoading from "./PartialLoading";

const NotesMode = () => {
  const { loading_partial, notes } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  useEffect(() => {
    dispatch(loadUserNotes());
  }, []);

  const handleNewNoteSubmit = (event) => {
    event.preventDefault();

    try {
      dispatch(createNote({ content: newNoteContent }));
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    } finally {
      setShowNewNoteForm(false);
      setNewNoteContent("");
    }
  };

  const handleNewNoteContent = (event) => {
    setNewNoteContent(event.target.value);
  };

  return (
    <div className='columns is-mobile'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {loading_partial ? (
          <PartialLoading />
        ) : (
          <Fragment>
            <div className='block'>
              {showNewNoteForm ? (
                <div className='block'>
                  <form onSubmit={handleNewNoteSubmit}>
                    <div className='field'>
                      <label className='label'>Nouvelle note</label>

                      <p className='control'>
                        <textarea
                          className='textarea is-info'
                          onChange={handleNewNoteContent}
                          value={newNoteContent}
                          placeholder='Contenu'
                          name='content'
                        ></textarea>
                      </p>
                    </div>

                    <div className='buttons'>
                      <button className='button is-small is-info' type='submit'>
                        Ajouter
                      </button>

                      <button
                        className='button is-small is-warning'
                        onClick={() => {
                          setShowNewNoteForm(false);
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className='block'>
                  <button
                    className='button is-medium is-info mt-5'
                    onClick={() => {
                      setShowNewNoteForm(true);
                    }}
                  >
                    Ajouter une note
                  </button>
                </div>
              )}

              <div className='block'>
                {notes && notes.length > 0 ? (
                  notes.map((note) => {
                    return <IndividualNote key={uuidv4()} note={note} />;
                  })
                ) : (
                  <div>
                    <p className='is-size-3'>Aucune note chargée</p>
                  </div>
                )}
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default NotesMode;
