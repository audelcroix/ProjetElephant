import React, { useState } from "react";

import { Link } from "react-router-dom";

const IndividualNote = (props) => {
  const { note } = { ...props };

  const contractText = (txt) => {
    if (txt.length > 150) {
      return txt.slice(0, 146) + "...";
    } else {
      return txt;
    }
  };

  const [showFullText, setShowFullText] = useState(false);

  return (
    <div className='box'>
      <div className='content'>
        <p>{showFullText ? note.content : contractText(note.content)}</p>

        {note.content.length > 150 && (
          <button
            className='button is-info is-small'
            onClick={() => {
              setShowFullText(!showFullText);
            }}
          >
            {showFullText ? "Réduire" : "Développer"}
          </button>
        )}

        <Link className='has-text-weight-medium ml-2' to={`/note/${note._id}`}>
          Voir
        </Link>
      </div>
    </div>
  );
};

export default IndividualNote;
