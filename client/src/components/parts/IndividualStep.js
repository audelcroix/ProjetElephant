import React, { useState } from "react";

const IndividualStep = (props) => {
  const { step, deleteFunction, updateFunction } = props;

  const [showStepUpdateForm, setShowStepUpdateForm] = useState(false);
  const [updatedStep, setUpdatedStep] = useState({ content: step.content });

  const handleUpdatedStepChange = (event) => {
    setUpdatedStep({
      ...updatedStep,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className='block'>
      {showStepUpdateForm ? (
        <div className='box'>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateFunction({
                stepId: step._id,
                content: updatedStep.content,
              });
              setShowStepUpdateForm(false);
            }}
          >
            <div className='field'>
              <label className='label'>Contenu</label>

              <p className='control'>
                <input
                  className='input is-small is-info'
                  type='text'
                  value={updatedStep.content}
                  name='content'
                  placeholder='Contenu'
                  onChange={handleUpdatedStepChange}
                />
              </p>
            </div>

            <div className='field is-grouped'>
              <div className='control'>
                <button className='button is-warning is-small' type='submit'>
                  Modifier
                </button>
              </div>

              <div className='control'>
                <button
                  className='button is-info is-small'
                  onClick={() => setShowStepUpdateForm(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className='box'>
          <p className='has-text-weight-normal mb-2'>{step.content}</p>

          <div className='buttons'>
            <button
              onClick={() => {
                setShowStepUpdateForm(true);
              }}
              title='Modifier'
              className='button is-small is-warning'
            >
              Modifier
            </button>

            <button
              onClick={() => {
                deleteFunction(step._id);
              }}
              title='Supprimer'
              className='button is-small is-danger'
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualStep;
