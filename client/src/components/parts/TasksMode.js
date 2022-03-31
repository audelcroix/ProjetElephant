import React, { Fragment, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from "date-fns/locale/fr";

import { useSelector, useDispatch } from "react-redux";
import {
  loadUserTasks,
  addNewTask,
  setErrorMsgs,
} from "./../../actions/userActions";
import IndividualTask from "./IndividualTask";
import PartialLoading from "./PartialLoading";

const TasksMode = () => {
  const { loading_partial, user, tasks } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskLimitDate, setNewTaskLimitDate] = useState();

  registerLocale("fr", fr);

  useEffect(() => {
    dispatch(loadUserTasks());
  }, []);

  const handleNewTaskContent = (event) => {
    setNewTaskContent(event.target.value);
  };

  const handleNewTaskFormSubmit = (event) => {
    event.preventDefault();

    // validation
    if (newTaskContent.length > 280) {
      dispatch(
        setErrorMsgs("Le contenu ne peut comporter plus de 280 caractères")
      );
    }

    if (newTaskContent.length < 3) {
      dispatch(setErrorMsgs("Le contenu doit comporter au moins 3 caractères"));
    }

    dispatch(
      addNewTask({ content: newTaskContent, limitDate: newTaskLimitDate })
    );

    setShowNewTaskForm(false);
    setNewTaskContent("");
    setNewTaskLimitDate();
  };

  return (
    <div className='columns'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {loading_partial ? (
          <PartialLoading />
        ) : (
          <Fragment>
            <div className='block'>
              {showNewTaskForm ? (
                <div className='block'>
                  <form className='my-5' onSubmit={handleNewTaskFormSubmit}>
                    <div className='field'>
                      <label className='label'>Nouvelle tâche:</label>

                      <p className='control'>
                        <textarea
                          className='textarea is-info'
                          type='text'
                          name='content'
                          placeholder='Contenu'
                          value={newTaskContent}
                          onChange={handleNewTaskContent}
                          required
                        ></textarea>
                      </p>
                    </div>

                    <div className='field'>
                      <DatePicker
                        locale='fr'
                        selected={newTaskLimitDate}
                        onChange={(date) => setNewTaskLimitDate(date)}
                        dateFormatCalendar={"MMM yyyy"}
                        showMonthDropdown
                        useFullMonthInDropdown
                        closeOnScroll={true}
                        isClearable
                        placeholderText='Date limite'
                        dateFormat='dd/MM/yyyy'
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
                          setShowNewTaskForm(false);
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
                      setShowNewTaskForm(true);
                    }}
                  >
                    Ajouter une tâche
                  </button>
                </div>
              )}

              <div className='block'>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => {
                    return <IndividualTask key={uuidv4()} task={task} />;
                  })
                ) : (
                  <div>
                    <p className='is-size-3'>Aucune tâche chargée</p>
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

export default TasksMode;
