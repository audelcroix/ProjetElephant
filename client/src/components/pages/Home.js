import React, { Fragment, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setLoading } from "./../../actions/userActions";

import MainLoading from "../parts/MainLoading";
import Navbar from "../parts/Navbar";
import NotesMode from "../parts/NotesMode";
import ProcessesMode from "../parts/ProcessesMode";
import TasksMode from "../parts/TasksMode";
import CollectionsMode from "../parts/CollectionsMode";
import MessageBoard from "../parts/MessageBoard";
import ErrorMsgBoard from "../parts/ErrorMsgBoard";

const Home = () => {
  const { loading, mode } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(false));
  }, []);

  const modeSwitch = (mode) => {
    switch (mode) {
      case "TASKS":
        return <TasksMode />;

      case "PROCESSES":
        return <ProcessesMode />;

      case "COLLECTIONS":
        return <CollectionsMode />;

      case "NOTES":
        return <NotesMode />;

      default:
        break;
    }
  };

  return (
    <div>
      {loading ? (
        <MainLoading />
      ) : (
        <Fragment>
          <Navbar />

          <div className='columns my-0 py-0'>
            <div className='column is-half is-offset-one-quarter'>
              <MessageBoard />
              <ErrorMsgBoard />
            </div>
          </div>

          {modeSwitch(mode)}
        </Fragment>
      )}
    </div>
  );
};

export default Home;
