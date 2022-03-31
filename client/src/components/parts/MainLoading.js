import React from "react";

const MainLoading = () => {
  return (
    <div className='mt-5'>
      <progress className='progress is-large is-info mt-5' max='100'>
        60%
      </progress>
    </div>
  );
};

export default MainLoading;
