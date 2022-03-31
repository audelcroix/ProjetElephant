import React from "react";

const IndividualErrorMsg = (props) => {
  return (
    <div className='notification is-danger is-light'>
      <button className='delete' onClick={props.deleteFunction}></button>

      <p className='is-small'>{props.error_msg.error_msg}</p>
    </div>
  );
};

export default IndividualErrorMsg;
