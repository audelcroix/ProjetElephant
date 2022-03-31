import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  finishSubtask,
  unfinishSubtask,
  config,
  setErrorMsgs,
} from "./../../actions/userActions";

import axios from "axios";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from "date-fns/locale/fr";

import TaskTimeTable from "./TaskTimeTable";

const IndividualSubtask = (props) => {
  registerLocale("fr", fr);

  const { subtask } = { ...props };

  const dispatch = useDispatch();

  const [localSubtask, setLocalSubtask] = useState(subtask);

  const [subtaskIsUpdating, setSubtaskIsUpdating] = useState(false);

  const [updatedSubtaskContent, setUpdatedSubtaskContent] = useState(
    subtask.content
  );
  const [updatedSubtaskLimitDate, setUpdatedSubtaskLimitDate] = useState(
    subtask.limitDate && new Date(subtask.limitDate)
  );
  const [showSubtaskUpdateForm, setShowSubtaskUpdateForm] = useState(false);

  // Change subtask completion status
  const handleSubtaskCompletionChange = () => {
    try {
      setSubtaskIsUpdating(true);

      if (!localSubtask.isDone) {
        dispatch(finishSubtask(subtask._id)).then((res) => {
          if (res) {
            if (res.success) {
              setLocalSubtask(res.finishedSubtask);
            } else {
              dispatch(setErrorMsgs([res.response.data.error_msg]));
            }
          }
        });
      } else {
        dispatch(unfinishSubtask(subtask._id)).then((res) => {
          if (res) {
            if (res.success) {
              setLocalSubtask(res.unfinishedSubtask);
            } else {
              dispatch(setErrorMsgs([res.response.data.error_msg]));
            }
          }
        });
      }
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    } finally {
      setSubtaskIsUpdating(false);
    }
  };

  // Edit this subtask
  const handleUpdatedSubtaskContent = (event) => {
    setUpdatedSubtaskContent(event.target.value);
  };

  // GERE PAS ENCORE LES ERREURS
  const handleUpdateSubtask = async (event) => {
    try {
      event.preventDefault();

      // validation
      if (updatedSubtaskContent.length > 280) {
        dispatch(
          setErrorMsgs("Le contenu ne peut comporter plus de 280 caractères")
        );
      }

      if (updatedSubtaskContent.length < 3) {
        dispatch(
          setErrorMsgs("Le contenu doit comporter au moins 3 caractères")
        );
      }

      const res = await axios.patch(
        `http://localhost:5000/api/tasks/edit_subtask/${subtask._id}`,
        {
          content: updatedSubtaskContent,
          ...(updatedSubtaskLimitDate && {
            limitDate: updatedSubtaskLimitDate,
          }),
        },
        config
      );

      setLocalSubtask(res.data.updatedSubtask);

      setShowSubtaskUpdateForm(false);
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));

      // Reset form
      setUpdatedSubtaskContent(localSubtask.content);
      setUpdatedSubtaskLimitDate(
        subtask.limitDate ? new Date(subtask.limitDate) : null
      );
    }
  };

  return (
    <div className='box'>
      {subtaskIsUpdating ? (
        <div>
          <p>Mise à jour en cours...</p>
        </div>
      ) : showSubtaskUpdateForm ? (
        <div>
          <form onSubmit={handleUpdateSubtask}>
            <div className='field'>
              <label htmlFor='content'>Contenu</label>

              <p className='control'>
                <textarea
                  className='textarea is-info'
                  type='text'
                  name='content'
                  placeholder='Contenu'
                  value={updatedSubtaskContent}
                  onChange={handleUpdatedSubtaskContent}
                  required
                ></textarea>
              </p>
            </div>

            <div className='field'>
              <DatePicker
                locale='fr'
                selected={updatedSubtaskLimitDate}
                onChange={(date) => setUpdatedSubtaskLimitDate(date)}
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
                  setShowSubtaskUpdateForm(false);
                  // Reset form
                  setUpdatedSubtaskContent(localSubtask.content);
                  setUpdatedSubtaskLimitDate(
                    subtask.limitDate ? new Date(subtask.limitDate) : null
                  );
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className='block'>
          <div className='content'>
            {localSubtask.limitDate && (
              <TaskTimeTable limitDate={localSubtask.limitDate} />
            )}

            <p>{localSubtask.content}</p>
          </div>

          <div className='buttons'>
            <button
              className={
                localSubtask.isDone
                  ? "button is-small is-primary"
                  : "button is-small is-info"
              }
              onClick={handleSubtaskCompletionChange}
            >
              {localSubtask.isDone ? "Terminée" : "En cours"}
            </button>
            {!localSubtask.isDone && (
              <button
                className='button is-small is-warning'
                onClick={() => {
                  setShowSubtaskUpdateForm(true);
                }}
              >
                Modifier
              </button>
            )}
            <button
              className='button is-small is-danger'
              onClick={() => {
                setSubtaskIsUpdating(true);
                props.deleteFunction(subtask._id);
              }}
            >
              Supprimer
            </button>{" "}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualSubtask;
