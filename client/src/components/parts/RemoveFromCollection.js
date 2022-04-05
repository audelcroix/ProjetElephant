import React from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  removeFromCollection,
  config,
  setErrorMsgs,
} from "../../actions/userActions";

import IndividualCollection from "./IndividualCollection";

const RemoveFromCollection = (props) => {
  const dispatch = useDispatch();
  const { origin, targetDocumentId, currentCollections } = props;

  const handleRemoveFromCollectionDemand = async (collectionId) => {
    try {
      let adaptiveFormData;

      switch (origin) {
        case "processes":
          adaptiveFormData = {
            processId: targetDocumentId,
            collectionId: collectionId,
          };
          break;

        case "tasks":
          adaptiveFormData = {
            taskId: targetDocumentId,
            collectionId: collectionId,
          };
          break;

        case "notes":
          adaptiveFormData = {
            noteId: targetDocumentId,
            collectionId: collectionId,
          };
          break;

        default:
          break;
      }

      const removeFromCollectionRes = await axios.patch(
        `http://localhost:5000/api/${origin}/remove_from_collection`,
        adaptiveFormData,
        config
      );

      dispatch(
        removeFromCollection(removeFromCollectionRes.data.updatedCollection)
      );

      props.removeCollectionFromMotherProcess(
        removeFromCollectionRes.data.updatedCollection
      );
    } catch (err) {
      dispatch(setErrorMsgs([err.response.data.error_msg]));
    }
  };

  return (
    <div className='block'>
      <h2 className='subtitle'>Collections:</h2>

      {currentCollections.length > 0 ? (
        currentCollections.map((collection) => {
          return (
            <div key={uuidv4()}>
              <IndividualCollection collection={collection} />

              <small
                className='is-size-7 is-clickable'
                onClick={() => {
                  handleRemoveFromCollectionDemand(collection._id);
                }}
              >
                Supprimer de cette collection
              </small>
            </div>
          );
        })
      ) : (
        <p className='is-size-4 has-text-centered has-text-weight-semibold'>
          Ce document n'appartient à aucune collection
        </p>
      )}
    </div>
  );
};

export default RemoveFromCollection;
