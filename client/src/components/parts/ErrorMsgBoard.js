import React from "react";

import { useSelector, useDispatch } from "react-redux";
import IndividualErrorMsg from "./IndividualErrorMsg";

import {
  deleteIndividualErrorMsg,
  deleteAllErrorMsg,
} from "./../../actions/userActions";

const ErrorMsgBoard = () => {
  const dispatch = useDispatch();
  const { error_msgs } = useSelector((state) => state.user);

  return (
    <div className='block'>
      {error_msgs.map((error_msg) => {
        return (
          <IndividualErrorMsg
            key={error_msg._id}
            error_msg={error_msg}
            deleteFunction={() => {
              dispatch(deleteIndividualErrorMsg(error_msg._id));
            }}
          />
        );
      })}

      {error_msgs.length > 0 && (
        <button
          className='button is-danger is-small'
          onClick={() => {
            dispatch(deleteAllErrorMsg());
          }}
        >
          Supprimer tous les messages d'erreurs
        </button>
      )}
    </div>
  );
};

export default ErrorMsgBoard;
