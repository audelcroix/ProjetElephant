import React from "react";

import { useSelector, useDispatch } from "react-redux";
import IndividualErrorMsg from "./IndividualErrorMsg";

import {
  deleteIndividualMessage,
  deleteAllMessages,
} from "./../../actions/userActions";

const MessageBoard = () => {
  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.user);

  return (
    <div>
      {messages.length > 0 && (
        <button
          onClick={() => {
            dispatch(deleteAllMessages());
          }}
        >
          Supprimer tous les messages
        </button>
      )}

      {messages.map((message) => {
        return (
          <IndividualErrorMsg
            key={message._id}
            message={message}
            deleteFunction={() => {
              dispatch(deleteIndividualMessage(message._id));
            }}
          />
        );
      })}
    </div>
  );
};

export default MessageBoard;
