import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCollection,
  config,
  setErrorMsgs,
} from "./../../actions/userActions";

const AddToCollectionForm = (props) => {
  const dispatch = useDispatch();
  const { collections } = useSelector((state) => state.user);

  const [selectedCollectionId, setSelectedCollectionId] = useState(
    collections[0] ? collections[0]._id : null
  );

  const handleSelectSubmit = async (event) => {
    event.preventDefault();

    try {
      let targetCollection = collections.find((collection) => {
        return collection._id === selectedCollectionId;
      });

      let adaptiveFormData;

      switch (props.origin) {
        case "processes":
          adaptiveFormData = {
            processId: props.targetDocumentId,
            collectionId: targetCollection._id,
          };
          break;

        case "tasks":
          adaptiveFormData = {
            taskId: props.targetDocumentId,
            collectionId: targetCollection._id,
          };
          break;

        case "notes":
          adaptiveFormData = {
            noteId: props.targetDocumentId,
            collectionId: targetCollection._id,
          };
          break;

        default:
          break;
      }

      const addToCollectionRes = await axios.patch(
        `http://localhost:5000/api/${props.origin}/add_to_collection`,
        adaptiveFormData,
        config
      );

      dispatch(addToCollection(addToCollectionRes.data.updatedCollection));

      props.addCollectionToMotherProcess(
        addToCollectionRes.data.updatedCollection
      );

      props.closeAddToCollectionForm();
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    }
  };

  const handleSelectChange = (event) => {
    setSelectedCollectionId(event.target.value);
  };

  return (
    <div className='block'>
      {collections.length > 0 ? (
        <form onSubmit={handleSelectSubmit}>
          <div className='field'>
            <label className='label'>Collections:</label>

            <div className='select is-info'>
              <select
                value={selectedCollectionId}
                onChange={handleSelectChange}
              >
                {collections.map((collection, index) => {
                  collection[props.origin].some((doc) => {
                    return doc === props.targetDocumentId;
                  });

                  return (
                    !collection[props.origin].some((doc) => {
                      return doc === props.targetDocumentId;
                    }) && (
                      <option value={collection._id} key={index}>
                        {collection.title}
                      </option>
                    )
                  );
                })}
              </select>
            </div>
          </div>

          <div className='buttons'>
            <button className='button is-small is-info' type='submit'>
              Ajouter à cette collection
            </button>

            <button
              className='button is-small is-warning'
              onClick={() => {
                props.closeAddToCollectionForm();
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <p className='is-size-4 has-text-centered has-text-weight-semibold'>
          Aucune collection à laquelle ajouter ce document
        </p>
      )}
    </div>
  );
};

export default AddToCollectionForm;
