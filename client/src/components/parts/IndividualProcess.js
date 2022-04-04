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
        <p>
          {process.steps.length} étape{process.steps.length > 1 && "s"}
        </p>
      </div>
    </Link>
  );
};

export default IndividualProcess;
