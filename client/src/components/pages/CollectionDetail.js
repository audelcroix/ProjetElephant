import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setLoading, config } from "./../../actions/userActions";

import MainLoading from "./../parts/MainLoading";
import IndividualNote from "../parts/IndividualNote";
import IndividualProcess from "../parts/IndividualProcess";
import IndividualTask from "../parts/IndividualTask";
import ErrorMsgBoard from "../parts/ErrorMsgBoard";
import MessageBoard from "../parts/MessageBoard";

import { setErrorMsgs } from "./../../actions/userActions";

const CollectionDetail = (props) => {
  const collectionId = props.match.params.collectionId;

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [currentCollection, setCurrentCollection] = useState({});

  const [showCollectionUpdateForm, setShowCollectionUpdateForm] =
    useState(false);
  const [updatedCollection, setUpdatedCollection] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const getCollection = async () => {
      try {
        dispatch(setLoading(true));

        const collectionRes = await axios.get(
          `http://localhost:5000/api/collections/get_collection_complete/${collectionId}`
        );

        console.log(collectionRes);

        setCurrentCollection(collectionRes.data.collectionComplete);

        setUpdatedCollection({
          title: collectionRes.data.collectionComplete.title,
          description: collectionRes.data.collectionComplete.description,
        });
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

        dispatch(setLoading(false));
      }
    };

    getCollection(collectionId);
  }, []);

  const handleCollectionUpdateSubmit = async (event) => {
    event.preventDefault();

    try {
      dispatch(setLoading(true));

      const collectionUpdateRes = await axios.patch(
        `http://localhost:5000/api/collections/update_collection/${currentCollection._id}`,
        {
          title: updatedCollection.title,
          description: updatedCollection.description,
        },
        config
      );

      setCurrentCollection({
        ...currentCollection,
        title: collectionUpdateRes.data.updatedCollection.title,
        description: collectionUpdateRes.data.updatedCollection.description,
      });
      setUpdatedCollection({ title: "", description: "" });

      setShowCollectionUpdateForm(false);

      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
      dispatch(setLoading(false));
    }
  };

  const handleCollectionUpdateChange = (event) => {
    setUpdatedCollection({
      ...updatedCollection,
      [event.target.name]: event.target.value,
    });
  };

  const handleDeleteCollection = async () => {
    try {
      console.log(currentCollection._id);
      dispatch(setLoading(true));

      const collectionDeleteRes = await axios.delete(
        `http://localhost:5000/api/collections/delete_collection/${currentCollection._id}`
      );

      props.history.push("/");
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
      dispatch(setLoading(false));
    }
  };

  return (
    <div className='columns'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {loading ? (
          <MainLoading />
        ) : (
          <Fragment>
            <div className='block mt-5'>
              <Link to={"/"} className='has-text-weight-medium'>
                Retour aux collections
              </Link>
            </div>

            <div className='columns my-0 py-0'>
              <div className='column is-half is-offset-one-quarter'>
                <MessageBoard />
                <ErrorMsgBoard />
              </div>
            </div>

            <div className='block'>
              <div className='content'>
                <h1>{currentCollection.title}</h1>

                <p>{currentCollection.description}</p>
              </div>
            </div>

            {showCollectionUpdateForm ? (
              <Fragment>
                <div className='block'>
                  <form onSubmit={handleCollectionUpdateSubmit}>
                    <div className='field'>
                      <label className='label'>Titre</label>

                      <p className='control'>
                        <input
                          className='input is-medium is-info'
                          value={updatedCollection.title}
                          type='text'
                          name='title'
                          placeholder='Titre'
                          onChange={handleCollectionUpdateChange}
                        />
                      </p>
                    </div>

                    <div className='field'>
                      <label className='label'>Titre</label>

                      <p className='control'>
                        <textarea
                          className='textarea is-info'
                          value={updatedCollection.description}
                          type='textarea'
                          name='description'
                          placeholder='Description'
                          onChange={handleCollectionUpdateChange}
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
                          setShowCollectionUpdateForm(false);
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </Fragment>
            ) : (
              <div className='block'>
                <div className='buttons'>
                  <button
                    className='button is-small is-warning'
                    onClick={() => {
                      setShowCollectionUpdateForm(true);
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    className='button is-small is-danger'
                    onClick={handleDeleteCollection}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}

            <h2 className='subtitle'>Tâches</h2>

            {currentCollection.tasks && currentCollection.tasks.length > 0 ? (
              currentCollection.tasks.map((task) => {
                return <IndividualTask key={uuidv4()} task={task} />;
              })
            ) : (
              <p className='is-size-6 has-text-weight-light'>
                Aucune tâche associée à cette collection
              </p>
            )}

            <h2 className='subtitle'>Notes</h2>

            {currentCollection.notes && currentCollection.notes.length > 0 ? (
              currentCollection.notes.map((note) => {
                return <IndividualNote key={uuidv4()} note={note} />;
              })
            ) : (
              <p className='is-size-6 has-text-weight-light'>
                Aucune note associée à cette collection
              </p>
            )}

            <h2 className='subtitle'>Processus</h2>

            {currentCollection.processes &&
            currentCollection.processes.length > 0 ? (
              currentCollection.processes.map((process) => {
                return <IndividualProcess key={uuidv4()} process={process} />;
              })
            ) : (
              <p className='is-size-6 has-text-weight-light'>
                Aucun processus associée à cette collection
              </p>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default CollectionDetail;
