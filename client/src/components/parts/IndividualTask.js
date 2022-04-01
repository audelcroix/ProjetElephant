import React, { useState, Fragment } from "react";
import { Link } from "react-router-dom";

import TaskTimeTable from "./TaskTimeTable";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useDispatch } from "react-redux";
import {
  deleteTaskAndSubtasks,
  unfinishTask,
  finishTask,
  updateTask,
} from "./../../actions/userActions";

const IndividualTask = (props) => {
  const { task } = { ...props };
  const dispatch = useDispatch();

  const [isBeingUpdated, setIsBeingUpdated] = useState(false);
  const [updatedTaskContent, setUpdatedTaskContent] = useState(task.content);
  const [updatedTaskLimitDate, setUpdatedTaskLimitDate] = useState(
    task.limitDate ? new Date(task.limitDate) : null
  );

  const handleTaskUpdate = (event) => {
    event.preventDefault();

    dispatch(
      updateTask({
        limitDate: updatedTaskLimitDate,
        content: updatedTaskContent,
        taskToUpdateId: task._id,
      })
    );
  };

  const handleUpdatedTaskContent = (event) => {
    setUpdatedTaskContent(event.target.value);
  };

  return (
    <div className='box'>
      {isBeingUpdated ? (
        <div>
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
        <Fragment>
          <div className='block'>
            {task.limitDate && <TaskTimeTable limitDate={task.limitDate} />}
          </div>

          <div className='block'>
            <div className='content'>
              <Link to={`/task/${task._id}`}>
                <p>
                  {task.content} <span>{task.isCompositeTask && " (+)"}</span>
                </p>
              </Link>
            </div>

            <div className='buttons'>
              {task.isDone ? (
                <button
                  className='button is-small is-primary'
                  onClick={() => {
                    dispatch(unfinishTask(task._id));
                  }}
                >
                  Terminée
                </button>
              ) : (
                <button
                  className='button is-small is-info'
                  onClick={() => {
                    dispatch(finishTask(task._id));
                  }}
                >
                  En cours
                </button>
              )}

              {!task.isDone && (
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
                  dispatch(deleteTaskAndSubtasks(task._id));
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default IndividualTask;
