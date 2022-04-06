import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import {
  deleteTaskAndSubtasks,
  unfinishTask,
  finishTask,
  updateTask,
  setLoading,
  addSubtask,
  deleteSubtask,
  setErrorMsgs,
} from "./../../actions/userActions";

import MainLoading from "../parts/MainLoading";
import IndividualSubtask from "../parts/IndividualSubtask";
import RemoveFromCollection from "../parts/RemoveFromCollection";
import AddToCollectionForm from "../parts/AddToCollectionForm";
import TaskTimeTable from "../parts/TaskTimeTable";
import ErrorMsgBoard from "../parts/ErrorMsgBoard";
import MessageBoard from "../parts/MessageBoard";

import "moment-timezone";
import "moment/locale/fr";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from "date-fns/locale/fr";

const TaskDetail = (props) => {
  registerLocale("fr", fr);

  const { loading } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [currentTask, setCurrentTask] = useState(null);

  const [isBeingUpdated, setIsBeingUpdated] = useState(false);
  const [updatedTaskContent, setUpdatedTaskContent] = useState("");
  const [updatedTaskLimitDate, setUpdatedTaskLimitDate] = useState(null);

  const [showAddToCollectionForm, setShowAddToCollectionForm] = useState(false);

  const [isUrgentTask, setIsUrgentTask] = useState(false);
  const [isPastTask, setIsPastTask] = useState(false);

  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState("");
  const [newSubtaskLimitDate, setNewSubtaskLimitDate] = useState();
  const [localSubtasks, setLocalSubtasks] = useState([]);

  const updateTaskUrgencyStatus = (taskToCheck) => {
    let today = new Date();
    let taskToCheckTime = new Date(taskToCheck.limitDate);

    if (today.getDate() + 2 >= taskToCheckTime.getDate()) {
      setIsUrgentTask(true);
    } else {
      setIsUrgentTask(false);
    }

    if (taskToCheckTime.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0)) {
      setIsPastTask(true);
    } else {
      setIsPastTask(false);
    }
  };

  const handleTaskUpdate = (event) => {
    try {
      dispatch(
        updateTask(
          {
            limitDate: updatedTaskLimitDate,
            content: updatedTaskContent,
            taskToUpdateId: currentTask._id,
          },
          true
        )
      ).then((res) => {
        if (res && res.updatedTask) {
          setCurrentTask(res.updatedTask);
          if (!currentTask.isDone) {
            updateTaskUrgencyStatus(res.updatedTask);
          }
        }
      });

      setIsBeingUpdated(false);
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    }

    event.preventDefault();
  };

  const handleUpdatedTaskContent = (event) => {
    setUpdatedTaskContent(event.target.value);
  };

  // Handle form modification
  const handleNewSubtaskContent = (event) => {
    setNewSubtaskContent(event.target.value);
  };

  const handleAddNewSubtask = (event) => {
    event.preventDefault();

    // validation
    if (newSubtaskContent.length > 280) {
      dispatch(
        setErrorMsgs("Le contenu ne peut comporter plus de 280 caractères")
      );
    }

    if (newSubtaskContent.length < 3) {
      dispatch(setErrorMsgs("Le contenu doit comporter au moins 3 caractères"));
    }

    dispatch(
      addSubtask(
        { content: newSubtaskContent, limitDate: newSubtaskLimitDate },
        currentTask._id
      )
    ).then((res) => {
      setNewSubtaskContent("");
      setNewSubtaskLimitDate();

      if (res.data && res.data.newSubTask) {
        setLocalSubtasks([...localSubtasks, res.data.newSubTask]);

        setIsAddingSubtask(false);
      }
    });
  };

  // Load the task and its subtasks
  useEffect(() => {
    const getTask = async () => {
      try {
        dispatch(setLoading(true));

        const res = await axios.get(
          `http://localhost:5000/api/tasks/get_task_complete/${props.match.params.taskId}`
        );

        setCurrentTask(res.data.task);

        if (!res.data.task.isDone) {
          updateTaskUrgencyStatus(res.data.task);
        }

        setUpdatedTaskContent(res.data.task.content);
        setUpdatedTaskLimitDate(
          res.data.task.limitDate && new Date(res.data.task.limitDate)
        );

        setLocalSubtasks(res.data.task.subtasks);

        dispatch(setLoading(false));
      } catch (err) {
        dispatch(
          setErrorMsgs(
            err.response && err.response.data.error_msg
              ? [err.response.data.error_msg]
              : [
                  "Nous sommes désolés, une erreur inattendue s'est produite lors du chargement",
                ]
          )
        );

        props.history.push("/");
      }
    };

    getTask();
  }, []);

  const deleteSubtaskFunction = (subtaskToDeleteId) => {
    dispatch(deleteSubtask(subtaskToDeleteId)).then((res) => {
      if (res && !res.success) {
        dispatch(setErrorMsgs([res.response.data.error_msg]));
      } else if (res && res.success) {
        setLocalSubtasks(
          localSubtasks.filter((subtask) => {
            return subtask._id !== subtaskToDeleteId;
          })
        );
      }
    });
  };

  return (
    <div className='columns'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {loading ? (
          <MainLoading />
        ) : currentTask ? (
          <Fragment>
            <div className='block mt-5'>
              <Link to={"/"} className='has-text-weight-medium'>
                Retour aux tâches
              </Link>
            </div>

            <div className='columns my-0 py-0'>
              <div className='column is-half is-offset-one-quarter'>
                <MessageBoard />
                <ErrorMsgBoard />
              </div>
            </div>

            {isBeingUpdated ? (
              <div className='block'>
                <form onSubmit={handleTaskUpdate}>
                  <div className='field'>
                    <label htmlFor='content'>Contenu</label>

                    <p className='control'>
                      <textarea
                        className='textarea is-info'
                        type='text'
                        name='content'
                        placeholder='Contenu'
                        value={updatedTaskContent}
                        onChange={handleUpdatedTaskContent}
                        required
                      ></textarea>
                    </p>
                  </div>
                  <div className='field'>
                    <DatePicker
                      locale='fr'
                      selected={updatedTaskLimitDate}
                      onChange={(date) => setUpdatedTaskLimitDate(date)}
                      dateFormatCalendar={"MMM yyyy"}
                      showMonthDropdown
                      useFullMonthInDropdown
                      closeOnScroll={true}
                      isClearable
                      placeholderText='Date limite'
                      dateFormat='dd/MM/yyyy HH:mm'
                      className='blue-border input control is-info'
                      showTimeInput
                    />
                  </div>

                  <div className='buttons'>
                    <button className='button is-small is-info' type='submit'>
                      Modifier
                    </button>

                    <button
                      className='button is-small is-warning'
                      onClick={() => {
                        setIsBeingUpdated(false);
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className='block'>
                <div className='block'>
                  {currentTask.limitDate && (
                    <TaskTimeTable limitDate={currentTask.limitDate} />
                  )}
                </div>

                <div className='content'>
                  <p>{currentTask.content}</p>
                </div>

                <div className='buttons'>
                  {currentTask.isDone ? (
                    <button
                      className='button is-small is-primary'
                      onClick={() => {
                        dispatch(unfinishTask(currentTask._id, true)).then(
                          (res) => {
                            if (res.unfinishedTask) {
                              setCurrentTask(res.unfinishedTask);
                              updateTaskUrgencyStatus(res.unfinishedTask);
                            }
                          }
                        );
                      }}
                    >
                      Terminée
                    </button>
                  ) : (
                    <button
                      className='button is-small is-info'
                      onClick={() => {
                        dispatch(finishTask(currentTask._id, true)).then(
                          (res) => {
                            if (res.finishedTask) {
                              setCurrentTask(res.finishedTask);
                              updateTaskUrgencyStatus(res.finishedTask);
                            }
                          }
                        );
                      }}
                    >
                      En cours
                    </button>
                  )}

                  {!currentTask.isDone && (
                    <button
                      className='button is-small is-warning'
                      onClick={() => {
                        setIsBeingUpdated(true);
                      }}
                    >
                      Modifier
                    </button>
                  )}

                  <button
                    className='button is-small is-danger'
                    onClick={() => {
                      dispatch(
                        deleteTaskAndSubtasks(currentTask._id, true)
                      ).then((res) => {
                        if (res.success) {
                          props.history.push("/");
                        }
                      });
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}

            {/* SUBTASKS */}

            {!isAddingSubtask && (
              <div className='block'>
                <button
                  className='button is-small is-info'
                  onClick={() => {
                    setIsAddingSubtask(true);
                  }}
                >
                  Ajouter une sous-tâche
                </button>
              </div>
            )}

            {isAddingSubtask && (
              <div className='block'>
                <form onSubmit={handleAddNewSubtask}>
                  <div className='field'>
                    <label htmlFor='content'>Contenu</label>

                    <p className='control'>
                      <textarea
                        className='textarea is-info'
                        type='text'
                        name='content'
                        placeholder='Contenu'
                        value={newSubtaskContent}
                        onChange={handleNewSubtaskContent}
                        required
                      ></textarea>
                    </p>
                  </div>

                  <div className='field'>
                    <DatePicker
                      locale='fr'
                      selected={newSubtaskLimitDate}
                      onChange={(date) => setNewSubtaskLimitDate(date)}
                      dateFormatCalendar={"MMM yyyy"}
                      showMonthDropdown
                      useFullMonthInDropdown
                      closeOnScroll={true}
                      isClearable
                      placeholderText='Date limite'
                      dateFormat='dd/MM/yyyy HH:mm'
                      className='blue-border input control is-info'
                      showTimeInput
                    />
                  </div>

                  <div className='buttons'>
                    <button className='button is-small is-info' type='submit'>
                      Ajouter
                    </button>

                    <button
                      className='button is-small is-light'
                      onClick={() => {
                        setIsAddingSubtask(false);
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className='block'>
              {localSubtasks.length > 0 ? (
                <ul>
                  {localSubtasks.map((subtask) => {
                    return (
                      <IndividualSubtask
                        key={uuidv4()}
                        subtask={subtask}
                        deleteFunction={deleteSubtaskFunction}
                      />
                    );
                  })}
                </ul>
              ) : (
                <p className='is-size-6  has-text-weight-semibold'>
                  <small>Aucune sous-tâche</small>
                </p>
              )}
            </div>

            <RemoveFromCollection
              origin={"tasks"}
              targetDocumentId={currentTask._id}
              currentCollections={currentTask.collections}
              removeCollectionFromMotherProcess={(collectionObject) => {
                setCurrentTask({
                  ...currentTask,
                  collections: currentTask.collections.filter((collection) => {
                    return collection._id !== collectionObject._id;
                  }),
                });
              }}
            />

            {showAddToCollectionForm ? (
              <AddToCollectionForm
                origin={"tasks"}
                targetDocumentId={currentTask._id}
                addCollectionToMotherProcess={(collectionObject) => {
                  setCurrentTask({
                    ...currentTask,
                    collections: [...currentTask.collections, collectionObject],
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
            Aucune tâche chargée
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
