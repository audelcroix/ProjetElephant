import React from "react";
import { Link } from "react-router-dom";

const IndividualProcess = (props) => {
  const { process } = { ...props };

  return (
    <Link
      to={`/process/${process._id}`}
      className='box has-background-info-light'
    >
      <div>
        <h4>{process.title}</h4>
      </div>
    </Link>
  );
};

export default IndividualProcess;
