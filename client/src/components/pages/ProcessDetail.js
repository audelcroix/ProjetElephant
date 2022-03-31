import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { useSelector, useDispatch } from "react-redux";
import { setLoading, config, setErrorMsgs } from "./../../actions/userActions";

import MainLoading from "./../parts/MainLoading";
import IndividualStep from "./../parts/IndividualStep";
import AddToCollectionForm from "../parts/AddToCollectionForm";
import RemoveFromCollection from "../parts/RemoveFromCollection";
import ErrorMsgBoard from "../parts/ErrorMsgBoard";
import MessageBoard from "../parts/MessageBoard";

const ProcessDetail = (props) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [currentProcess, setCurrentProcess] = useState(null);
  const [localSteps, setLocalSteps] = useState([]);

  const [showProcessUpdateForm, setShowProcesUpdateForm] = useState(false);
  const [updatedProcess, setUpdatedProcess] = useState({
    description: "",
    title: "",
  });

  const [showAddToCollectionForm, setShowAddToCollectionForm] = useState(false);

  const [showNewStepForm, setShowNewStepForm] = useState(false);
  const [newStep, setNewStep] = useState({ content: "" });

  const handleProcessUpdateFormChange = (event) => {
    setUpdatedProcess({
      ...updatedProcess,
      [event.target.name]: event.target.value,
    });
  };

  // GERE PAS ENCORE LES ERREURS ?
  const handleProcessUpdateFormSubmit = async (event) => {
    event.preventDefault();

    try {
      dispatch(setLoading(true));

      await axios
        .patch(
          `http://localhost:5000/api/processes/edit_process/${currentProcess._id}`,
          {
            description: updatedProcess.description,
            title: updatedProcess.title,
          },
          config
        )
        .then((res) => {
          setCurrentProcess(res.data.updatedProcess);
          setUpdatedProcess({
            title: res.data.updatedProcess.title,
            description: res.data.updatedProcess.description,
          });
          setShowProcesUpdateForm(false);
        });
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleNewStepChange = (event) => {
    setNewStep({
      ...newStep,
      [event.target.name]: event.target.value,
    });
  };

  const handleNewStepFormSubmit = async (event) => {
    event.preventDefault();
    try {
      dispatch(setLoading(true));

      await axios
        .post(
          `http://localhost:5000/api/processes/new_step/${currentProcess._id}`,
          {
            content: newStep.content,
          },
          config
        )
        .then((res) => {
          setCurrentProcess(res.data.updatedProcess);

          setLocalSteps([...localSteps, res.data.newStep]);

          setShowNewStepForm(false);
          setNewStep({
            content: "",
          });
        });
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleProcessDelete = async () => {
    try {
      const deleteProcessRes = await axios.delete(
        `http://localhost:5000/api/processes/delete_process/${currentProcess._id}`
      );

      props.history.push("/");
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    }
  };

  const deleteStepFunction = async (stepToDeleteId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/processes/delete_step/${stepToDeleteId}`
      );

      setLocalSteps(
        localSteps.filter((step) => {
          return step._id != stepToDeleteId;
        })
      );
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateStepFunction = async (formData) => {
    console.log(formData);
    dispatch(setLoading(true));
    try {
      let stepToUpdateIndex = localSteps.findIndex((step) => {
        return step._id == formData.stepId;
      });
      const stepUpdateRes = await axios.patch(
        `http://localhost:5000/api/processes/edit_step/${formData.stepId}`,
        { content: formData.content },
        config
      );

      localSteps[stepToUpdateIndex] = stepUpdateRes.data.updatedStep;
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    const getProcess = async () => {
      try {
        dispatch(setLoading(true));

        const res = await axios.get(
          `http://localhost:5000/api/processes/get_process_steps/${props.match.params.processId}`
        );

        setCurrentProcess(res.data.targetProcess);

        setUpdatedProcess({
          description: res.data.targetProcess.description,
          title: res.data.targetProcess.title,
        });

        setLocalSteps(res.data.targetProcess.steps);

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

    getProcess();
  }, []);

  return (
    <div className='columns'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {loading ? (
          <MainLoading />
        ) : (
          <Fragment>
            <div className='block mt-5'>
              <Link to={"/"} className='has-text-weight-medium'>
                Retour aux processus
              </Link>
            </div>

            <div className='columns my-0 py-0'>
              <div className='column is-half is-offset-one-quarter'>
                <MessageBoard />
                <ErrorMsgBoard />
              </div>
            </div>

            {currentProcess ? (
              <Fragment>
                {showProcessUpdateForm ? (
                  <div className='block'>
                    <form onSubmit={handleProcessUpdateFormSubmit}>
                      <div className='field'>
                        <label className='label'>Titre</label>

                        <p className='control'>
                          <input
                            type='text'
                            className='input is-medium is-info'
                            value={updatedProcess.title}
                            name='title'
                            onChange={handleProcessUpdateFormChange}
                          />
                        </p>
                      </div>

                      <div className='field'>
                        <label className='label'>Description</label>

                        <p className='control'>
                          <textarea
                            className='textarea is-info'
                            value={updatedProcess.description}
                            name='description'
                            placeholder='Description du processus'
                            onChange={handleProcessUpdateFormChange}
                          ></textarea>
                        </p>
                      </div>

                      <div className='buttons'>
                        <button
                          className='button is-small is-info'
                          type='submit'
                        >
                          Valider
                        </button>

                        <button
                          className='button is-small is-warning'
                          onClick={() => {
                            setShowProcesUpdateForm(false);
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
                        <h2 className='subtitle'>{currentProcess.title}</h2>

                        <p className=''>{currentProcess.description}</p>
                      </div>
                    </div>

                    <div className='block'>
                      <div className='buttons'>
                        <button
                          className='button is-small is-warning'
                          onClick={() => {
                            setShowProcesUpdateForm(true);
                          }}
                        >
                          Modifier
                        </button>

                        <button
                          className='button is-small is-danger'
                          onClick={handleProcessDelete}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </Fragment>
                )}

                {localSteps.length > 0 ? (
                  localSteps.map((step) => {
                    return (
                      <IndividualStep
                        step={step}
                        key={uuidv4()}
                        deleteFunction={() => {
                          deleteStepFunction(step._id);
                        }}
                        updateFunction={updateStepFunction}
                      />
                    );
                  })
                ) : (
                  <p className='is-size-6 has-text-weight-semibold'>
                    Ce processus ne comprend aucune étape
                  </p>
                )}

                {/* COLLECTIONS */}

                <RemoveFromCollection
                  origin={"processes"}
                  targetDocumentId={currentProcess._id}
                  currentCollections={currentProcess.collections}
                  removeCollectionFromMotherProcess={(collectionObject) => {
                    setCurrentProcess({
                      ...currentProcess,
                      collections: currentProcess.collections.filter(
                        (collection) => {
                          return collection._id != collectionObject._id;
                        }
                      ),
                    });
                  }}
                />

                {showAddToCollectionForm ? (
                  <AddToCollectionForm
                    origin={"processes"}
                    targetDocumentId={currentProcess._id}
                    addCollectionToMotherProcess={(collectionObject) => {
                      setCurrentProcess({
                        ...currentProcess,
                        collections: [
                          ...currentProcess.collections,
                          collectionObject,
                        ],
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
              <p className='is-size-4 has-text-centered has-text-weight-semibold'>
                Aucun processus chargé
              </p>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default ProcessDetail;
