import React, { Fragment, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useSelector, useDispatch } from "react-redux";
import {
  setLoading,
  loadUserCollections,
  createCollection,
  setErrorMsgs,
} from "./../../actions/userActions";
import IndividualCollection from "./IndividualCollection";
import PartialLoading from "./PartialLoading";

const CollectionsMode = () => {
  const { loading_partial, collections } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserCollections());
  }, []);

  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: "",
    description: "",
  });

  const handleNewCollectionChange = (event) => {
    setNewCollection({
      ...newCollection,
      [event.target.name]: event.target.value,
    });
  };

  const handleNewCollectionSubmit = async (event) => {
    event.preventDefault();

    try {
      dispatch(setLoading(true));

      dispatch(
        createCollection({
          title: newCollection.title,
          description: newCollection.description,
        })
      );

      setShowNewCollectionForm(false);

      setNewCollection({
        title: "",
        description: "",
      });

      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
      dispatch(setLoading(false));
    }
  };

  return (
    <div className='columns is-mobile'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {loading_partial ? (
          <PartialLoading />
        ) : (
          <Fragment>
            <div className='block'>
              {showNewCollectionForm ? (
                <div className='block'>
                  <form className='my-5' onSubmit={handleNewCollectionSubmit}>
                    <div className='field'>
                      <label className='label'>Titre</label>

                      <p className='control'>
                        <input
                          className='input is-info'
                          type='text'
                          onChange={handleNewCollectionChange}
                          value={newCollection.title}
                          placeholder='Titre...'
                          name='title'
                        />
                      </p>
                    </div>

                    <div className='field'>
                      <label className='label'>Description</label>

                      <p className='control'>
                        <textarea
                          className='textarea is-info'
                          onChange={handleNewCollectionChange}
                          value={newCollection.description}
                          placeholder='Description...'
                          name='description'
                        ></textarea>
                      </p>
                    </div>

                    <div className='buttons'>
                      <button className='button is-small is-info' type='submit'>
                        Valider
                      </button>

                      <button
                        className='button is-small is-warning'
                        onClick={() => {
                          setShowNewCollectionForm(false);
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
                      setShowNewCollectionForm(true);
                    }}
                  >
                    Ajouter une collection
                  </button>
                </div>
              )}

              <div className='block'>
                {collections && collections.length > 0 ? (
                  collections.map((collection) => {
                    return (
                      <IndividualCollection
                        key={uuidv4()}
                        collection={collection}
                      />
                    );
                  })
                ) : (
                  <div>
                    <p className='is-size-3'>Aucune collection chargée</p>
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

export default CollectionsMode;
