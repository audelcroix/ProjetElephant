import { finishSubtask } from "../actions/userActions";
import {
  SET_LOADING,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGOUT,
  LOAD_COLLECTIONS,
  LOAD_TASKS,
  LOAD_PROCESSES,
  LOAD_NOTES,
  CHANGE_MODE,
  SET_LOADING_PARTIAL,
  NEW_TASK_ADDED,
  DELETE_TASK,
  ADD_SUBTASK,
  DELETE_SUBTASK,
  UPDATE_TASk,
  UNFINISH_TASK,
  FINISH_TASK,
  FINISH_SUBTASK,
  UNFINISH_SUBTASK,
  UPDATE_NOTE,
  DELETE_NOTE,
  ADD_NOTE,
  ADD_PROCESS,
  LOAD_PROCESS_AND_STEPS,
  DELETE_PROCESS,
  UPDATE_PROCESS,
  ADD_STEP,
  DELETE_STEP,
  UPDATE_STEP,
  ADD_NEW_COLLECTION,
  ADD_TO_COLLECTION,
  REMOVE_FROM_COLLECTION,
  SET_MESSAGES,
  SET_ERROR_MSGS,
  DELETE_INDIVIDUAL_ERROR_MSG,
  DELETE_ALL_ERROR_MSG,
  DELETE_ALL_MSG,
  DELETE_INDIVIDUAL_MSG,
} from "./../actions/types";

import { v4 as uuidv4 } from "uuid";

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  user: null,
  mode: "TASKS",
  notes: [],
  collections: [],
  processes: [],
  tasks: [],
  messages: [],
  error_msgs: [],

  loading_partial: false,
};

// eslint-disable-next-line
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };

    case SET_LOADING_PARTIAL:
      return { ...state, loading_partial: action.payload };

    case LOGIN_SUCCESS:
      localStorage.setItem("token", action.payload.token);
      console.log(action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        messages: [],
        error_msgs: [],
      };

    case AUTH_ERROR:
    case LOGOUT:
      localStorage.removeItem("token");

      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        loading_partial: false,
        user: null,
        notes: [],
        collections: [],
        processes: [],
        tasks: [],
        messages: [],
        error_msgs: [],

        mode: "TASKS",
      };

    case CHANGE_MODE:
      console.log(state);
      console.log(action.payload);

      return {
        ...state,
        mode: action.payload,
      };

    case LOAD_COLLECTIONS:
      return {
        ...state,
        collections: action.payload.collections,
      };

    case LOAD_NOTES:
      console.log(state);
      return {
        ...state,
        notes: action.payload.notes,
      };

    case LOAD_PROCESSES:
      return {
        ...state,
        processes: action.payload.processes,
      };

    case LOAD_TASKS:
      return {
        ...state,
        tasks: action.payload.tasks,
      };

    case NEW_TASK_ADDED:
      return { ...state, tasks: [...state.tasks, action.payload.newTask] };

    case DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => {
          return task._id !== action.payload.removedTask._id;
        }),
      };

    case UPDATE_TASk:
      let indexToUpdate = state.tasks.findIndex(
        (task) => task._id === action.payload.updatedTask._id
      );
      state.tasks[indexToUpdate] = action.payload.updatedTask;

      return { ...state };

    case FINISH_TASK:
      let indexToFinish = state.tasks.findIndex(
        (task) => task._id === action.payload.finishedTask._id
      );
      state.tasks[indexToFinish] = action.payload.finishedTask;

      return { ...state };

    case UNFINISH_TASK:
      let indexToUnfinish = state.tasks.findIndex(
        (task) => task._id === action.payload.unfinishedTask._id
      );
      state.tasks[indexToUnfinish] = action.payload.unfinishedTask;

      return { ...state };

    case ADD_SUBTASK:
      let indexMotherTaskToUpdateId = state.tasks.findIndex(
        (task) => task._id === action.payload.newSubTask.task._id
      );

      let motherTaskToAddSubtask = state.tasks[indexMotherTaskToUpdateId];

      motherTaskToAddSubtask.subtasks = [
        ...motherTaskToAddSubtask.subtasks,
        action.payload.newSubTask,
      ];

      return { ...state, tasks: [state.tasks, motherTaskToAddSubtask] };

    case DELETE_SUBTASK:
      let indexMotherTaskToDeleteSubtaskFromId = state.tasks.findIndex(
        (task) => task._id === action.payload.updatedMotherTask._id
      );

      state.tasks[indexMotherTaskToDeleteSubtaskFromId] =
        action.payload.updatedMotherTask;

      return { ...state };

    case UPDATE_NOTE:
      let indexNoteToUpdate = state.notes.findIndex(
        (note) => note._id === action.payload.note._id
      );

      state.notes[indexNoteToUpdate] = action.payload.note;

      return { ...state };

    case DELETE_NOTE:
      return {
        ...state,
        notes: [
          ...state.notes.filter((note) => {
            return note._id !== action.payload.removedNote._id;
          }),
        ],
      };

    case ADD_NOTE:
      console.log(state);
      console.log(action.payload.newNote);
      console.log(state.notes);
      return { ...state, notes: [...state.notes, action.payload.newNote] };

    case ADD_PROCESS:
      return {
        ...state,
        processes: [...state.processes, action.payload.newProcess],
      };

    case ADD_NEW_COLLECTION:
      return {
        ...state,
        collections: [...state.collections, action.payload.newCollection],
      };

    case REMOVE_FROM_COLLECTION:
    case ADD_TO_COLLECTION:
      let indexCollectionToAddDocument = state.collections.findIndex(
        (collection) => collection._id === action.payload._id
      );

      state.collections[indexCollectionToAddDocument] = action.payload;

      return {
        ...state,
      };

    case SET_ERROR_MSGS:
      console.log(action.payload);
      console.log(action.payload[0]);
      console.log(action.payload.length);
      let treatedErrors = action.payload.map((err) => {
        return { error_msg: err, _id: uuidv4() };
      });

      /* let treatedErrors = [];

      action.payload.forEach((errorToTreat) => {
        console.log({ error_msg: errorToTreat, _id: uuidv4() });
        treatedErrors.push({ error_msg: errorToTreat, _id: uuidv4() });
      }); */

      console.log(treatedErrors);

      console.log([...state.error_msgs, ...treatedErrors]);

      return {
        ...state,
        error_msgs: [...state.error_msgs, ...treatedErrors],
      };

    case DELETE_INDIVIDUAL_ERROR_MSG:
      return {
        ...state,
        error_msgs: state.error_msgs.filter((error_msg) => {
          return error_msg._id !== action.payload;
        }),
      };

    case DELETE_ALL_ERROR_MSG:
      return {
        ...state,
        error_msgs: [],
      };

    case SET_MESSAGES:
      let treatedMessages = action.payload.map((msg) => {
        return { msg: msg, _id: uuidv4() };
      });

      return {
        ...state,
        messages: [...state.messages, ...treatedMessages],
      };

    case DELETE_INDIVIDUAL_MSG:
      return {
        ...state,
        messages: state.messages.filter((message) => {
          return message._id !== action.payload;
        }),
      };

    case DELETE_ALL_MSG:
      return {
        ...state,
        messages: [],
      };

    default:
      return state;
  }
};
