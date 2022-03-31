import React, { useState, useEffect } from "react";

import Moment from "react-moment";
import "moment-timezone";
import "moment/locale/fr";

const TaskTimeTable = (props) => {
  const { limitDate } = props;

  const [delayToDisplay, setDelayToDisplay] = useState("");
  const [colorForDelayToDisplay, setColorForDelayToDisplay] =
    useState("has-text-black");

  useEffect(() => {
    const treatLimitDate = () => {
      const currentDate = new Date();

      const dateToCheck = new Date(limitDate);

      let currentDateOvermorrowMax = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 2,
        23,
        59,
        59
      );

      if (currentDate > dateToCheck) {
        setDelayToDisplay("Date limite dépassée - ");
        setColorForDelayToDisplay("has-text-danger");
      } else {
        if (
          currentDate < dateToCheck &&
          dateToCheck < currentDateOvermorrowMax
        ) {
          setDelayToDisplay("Tâche urgente - ");
          setColorForDelayToDisplay("has-text-primary");
        }
      }
    };

    treatLimitDate();
  }, []);

  return (
    <div className='block is-size-7'>
      <p className={colorForDelayToDisplay}>
        {delayToDisplay} <Moment locale='fr' date={limitDate} format='LLLL' />
      </p>
    </div>
  );
};

export default TaskTimeTable;
