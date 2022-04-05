import React, { Fragment, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useSelector, useDispatch } from "react-redux";
import {
  loadUserProcesses,
  createProcess,
  setErrorMsgs,
} from "./../../actions/userActions";
import IndividualProcess from "./IndividualProcess";
import PartialLoading from "./PartialLoading";

const ProcessesMode = () => {
  const { loading_partial, processes } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [showNewProcessForm, setShowNewProcessForm] = useState(false);
  const [newProcess, setNewProcess] = useState({
    title: "",
    description: "",
  });

  const handleNewProcessChange = (event) => {
    setNewProcess({
      ...newProcess,
      [event.target.name]: event.target.value,
    });
  };

  const handleNewProcessFormSubmit = async (event) => {
    event.preventDefault();

    try {
      dispatch(
        createProcess({
          title: newProcess.title,
          description: newProcess.description,
        })
      );
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    }
  };

  useEffect(() => {
    dispatch(loadUserProcesses());
  }, []);

  return (
    <div className='columns is-mobile'>
      <div className='column is-three-fifths is-offset-one-fifth'>
        {loading_partial ? (
          <PartialLoading />
        ) : (
          <Fragment>
            <div className='block mt-5'>
              {showNewProcessForm ? (
                <div className='block'>
                  <form className='my-5' onSubmit={handleNewProcessFormSubmit}>
                    <div className='field'>
                      <label className='label'>Titre</label>

                      <p className='control'>
                        <input
                          className='input is-info'
                          type='text'
                          name='title'
                          onChange={handleNewProcessChange}
                          placeholder='Titre...'
                          value={newProcess.title}
                        />
                      </p>
                    </div>

                    <div className='field'>
                      <label className='label'>Description</label>

                      <p className='control'>
                        <textarea
                          className='textarea is-info'
                          onChange={handleNewProcessChange}
                          placeholder='Description...'
                          name='description'
                          value={newProcess.description}
                        ></textarea>
                      </p>
                    </div>

                    <div className='field is-grouped'>
                      <div className='control'>
                        <button type='submit' className='button is-info'>
                          Créer
                        </button>
                      </div>

                      <div className='control'>
                        <button
                          onClick={() => {
                            setShowNewProcessForm(false);
                          }}
                          className='button is-warning'
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className='block'>
                  <button
                    className='button is-medium is-info '
                    onClick={() => {
                      setShowNewProcessForm(true);
                    }}
                  >
                    Créer un processus
                  </button>
                </div>
              )}

              <div>
                {processes && processes.length > 0 ? (
                  processes.map((process) => {
                    return (
                      <IndividualProcess key={uuidv4()} process={process} />
                    );
                  })
                ) : (
                  <div>
                    <p className='is-size-3'>Aucun processus chargé</p>
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

export default ProcessesMode;
