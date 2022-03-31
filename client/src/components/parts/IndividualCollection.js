import React from "react";

import { Link } from "react-router-dom";

const IndividualCollection = (props) => {
  const { collection } = { ...props };

  return (
    <div className='block my-1 is-size-6'>
      <Link
        className='has-text-weight-medium'
        to={`/collection/${collection._id}`}
      >
        {collection.title}
      </Link>
    </div>
  );
};

export default IndividualCollection;
