import axios from "axios";

import setAuthToken from "../utils/setAuthToken";

import {
  SET_LOADING,
  SET_LOADING_PARTIAL,
  LOGIN_SUCCESS,
  LOGOUT,
  CHANGE_MODE,
  LOAD_NOTES,
  LOAD_PROCESSES,
  LOAD_TASKS,
  LOAD_COLLECTIONS,
  NEW_TASK_ADDED,
  DELETE_TASK,
  UPDATE_TASk,
  FINISH_TASK,
  UNFINISH_TASK,
  ADD_SUBTASK,
  DELETE_SUBTASK,
  UPDATE_NOTE,
  DELETE_NOTE,
  ADD_NOTE,
  ADD_PROCESS,
  ADD_NEW_COLLECTION,
  ADD_TO_COLLECTION,
  REMOVE_FROM_COLLECTION,
  SET_MESSAGES,
  SET_ERROR_MSGS,
  DELETE_INDIVIDUAL_ERROR_MSG,
  DELETE_ALL_ERROR_MSG,
  DELETE_ALL_MSG,
  DELETE_INDIVIDUAL_MSG,
} from "./types";

// For JSON
export const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

// On/Off loading
export const setLoading =
  (loadingMode = false) =>
  (dispatch) => {
    if (typeof loadingMode !== "boolean") {
      loadingMode = false;
    }

    dispatch({ type: SET_LOADING, payload: loadingMode });
  };

// On/Off partial loading
export const setLoadingPartial =
  (loadingMode = false) =>
  (dispatch) => {
    if (typeof loadingMode !== "boolean") {
      loadingMode = false;
    }

    dispatch({ type: SET_LOADING_PARTIAL, payload: loadingMode });
  };

// Login user
export const login = (formData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const loginRes = await axios.post("/api/users/login", formData, config);

    const token = loginRes.data.token; // "token" comes from the back end
    setAuthToken(token);

    dispatch({ type: LOGIN_SUCCESS, payload: loginRes.data });

    // Load collections from the beginning so they can be added to documents easily
    dispatch(loadUserCollections());

    dispatch(setLoading(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoading(false));
  }
};

// Register user
export const register = (formData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const registerRes = await axios.post(
      "/api/users/register",
      formData,
      config
    );

    const token = registerRes.data.token; // "token" vient du back end

    setAuthToken(token);

    dispatch({ type: LOGIN_SUCCESS, payload: registerRes.data });

    // PROTOTYPE
    // Load collections from the beginning so they don't need to be loaded on many pages
    dispatch(loadUserCollections());

    dispatch(setLoading(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoading(false));
  }
};

// Logout user
export const logout = () => (dispatch) => {
  //dispatch({ type: REMOVE_ALL_ALERTS });
  dispatch({ type: LOGOUT });
};

// Change mode to display
export const changeMode =
  (modeToDisplay = "TASKS") =>
  (dispatch) => {
    const possibleModes = ["TASKS", "PROCESSES", "NOTES", "COLLECTIONS"];

    if (!possibleModes.includes(modeToDisplay)) {
      modeToDisplay = "TASKS";
    }
    dispatch({ type: CHANGE_MODE, payload: modeToDisplay });
  };

/////////////////
// NOTES
/////////////////

// Load user's notes
export const loadUserNotes = () => async (dispatch) => {
  try {
    dispatch(setLoadingPartial(true));
    const loadNotesRes = await axios.get("/api/notes/get_all_notes");

    const notes = loadNotesRes.data.notes;
    const msg = loadNotesRes.data.msg;

    dispatch({ type: LOAD_NOTES, payload: { notes, msg } });
    dispatch(setLoadingPartial(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));
  }
};

export const updateNote = (formData) => async (dispatch) => {
  try {
    const { noteToUpdateId } = formData;

    const updatedNoteRes = await axios.patch(
      `/api/notes/edit_note/${noteToUpdateId}`,
      formData,
      config
    );

    dispatch({ type: UPDATE_NOTE, payload: updatedNoteRes.data });
    return true;
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    return false;
  }
};

export const deleteNote = (noteToDeleteId) => async (dispatch) => {
  try {
    const deletedNoteRes = await axios.delete(
      `/api/notes/delete_note/${noteToDeleteId}`
    );

    dispatch({ type: DELETE_NOTE, payload: deletedNoteRes.data });
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );
  }
};

export const createNote = (formData) => async (dispatch) => {
  try {
    const createNoteRes = await axios.post(
      "/api/notes/new_note",
      formData,
      config
    );

    dispatch({ type: ADD_NOTE, payload: createNoteRes.data });
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );
  }
};

/////////////////
// PROCESSES
/////////////////

// Load user's processes
export const loadUserProcesses = () => async (dispatch) => {
  try {
    dispatch(setLoadingPartial(true));

    const loadProcessesRes = await axios.get(
      "/api/processes/get_all_processes"
    );

    const processes = loadProcessesRes.data.processes;
    const msg = loadProcessesRes.data.msg;

    dispatch({ type: LOAD_PROCESSES, payload: { processes, msg } });

    dispatch(setLoadingPartial(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));
  }
};

export const updateProcess = (formData) => async (dispatch) => {
  try {
    const updatedProcessRes = await axios.patch(
      `/api/processes/edit_process/${formData.processId}`,
      { description: formData.description, title: formData.title },
      config
    );

    return {
      success: true,
      updatedProcess: updatedProcessRes.data.updatedProcess,
    };
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    return {
      success: false,
      error_msg: err.response.error_msg,
    };
  }
};

export const createProcess = (formData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const createProcessRes = await axios.post(
      "/api/processes/new_process",
      formData,
      config
    );

    dispatch({ type: ADD_PROCESS, payload: createProcessRes.data });

    dispatch(setLoading(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoading(false));
  }
};

/////////////////
// TASKS
/////////////////

// Load user's tasks
export const loadUserTasks = () => async (dispatch) => {
  try {
    dispatch(setLoadingPartial(true));

    const loadTasksRes = await axios.get("/api/tasks/get_all_tasks");

    const tasks = loadTasksRes.data.tasks;
    const msg = loadTasksRes.data.msg;

    dispatch({ type: LOAD_TASKS, payload: { tasks, msg } });

    dispatch(setLoadingPartial(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));
  }
};

export const addNewTask = (formData) => async (dispatch) => {
  try {
    dispatch(setLoadingPartial(true));

    const newTaskRes = await axios.post(
      "/api/tasks/new_task_simple",
      formData,
      config
    );

    dispatch({ type: NEW_TASK_ADDED, payload: newTaskRes.data });

    dispatch(setLoadingPartial(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));
  }
};

export const deleteTaskAndSubtasks =
  (idToDelete, isForDetail) => async (dispatch) => {
    try {
      dispatch(setLoadingPartial(true));

      const taksToDelete = await axios.delete(
        `/api/tasks/delete_task/${idToDelete}`,
        config
      );

      dispatch({ type: DELETE_TASK, payload: taksToDelete.data });

      dispatch(setLoadingPartial(false));

      if (isForDetail) {
        return { success: true };
      }
    } catch (err) {
      dispatch(
        setErrorMsgs(
          err.response &&
            err.response.data &&
            err.response.status !== 404 &&
            err.response.data.error_msg
            ? err.response.data.error_msg
            : ["Oops, une erreur inattendue s'est produite"]
        )
      );

      dispatch(setLoadingPartial(false));
    }
  };

export const finishTask =
  (idToFinish, isForDetail = false) =>
  async (dispatch) => {
    try {
      dispatch(setLoadingPartial(true));

      const taskToFinish = await axios.patch(
        `/api/tasks/finish_task/${idToFinish}`,
        config
      );

      dispatch({ type: FINISH_TASK, payload: taskToFinish.data });

      dispatch(setLoadingPartial(false));

      if (isForDetail) {
        return taskToFinish.data;
      }
    } catch (err) {
      dispatch(
        setErrorMsgs(
          err.response &&
            err.response.data &&
            err.response.status !== 404 &&
            err.response.data.error_msg
            ? err.response.data.error_msg
            : ["Oops, une erreur inattendue s'est produite"]
        )
      );

      dispatch(setLoadingPartial(false));
    }
  };

export const unfinishTask =
  (idToUnfinish, isForDetail = false) =>
  async (dispatch) => {
    try {
      dispatch(setLoadingPartial(true));

      const taskToUnfinish = await axios.patch(
        `/api/tasks/unfinish_task/${idToUnfinish}`,
        config
      );

      dispatch({ type: UNFINISH_TASK, payload: taskToUnfinish.data });

      dispatch(setLoadingPartial(false));

      if (isForDetail) {
        return taskToUnfinish.data;
      }
    } catch (err) {
      dispatch(
        setErrorMsgs(
          err.response &&
            err.response.data &&
            err.response.status !== 404 &&
            err.response.data.error_msg
            ? err.response.data.error_msg
            : ["Oops, une erreur inattendue s'est produite"]
        )
      );

      dispatch(setLoadingPartial(false));
    }
  };

export const updateTask =
  (formData, isForDetail = false) =>
  async (dispatch) => {
    try {
      dispatch(setLoadingPartial(true));
      const { taskToUpdateId } = formData;

      const updatedTaskRes = await axios.patch(
        `/api/tasks/edit_task_simple/${taskToUpdateId}`,
        formData,
        config
      );

      dispatch({ type: UPDATE_TASk, payload: updatedTaskRes.data });

      dispatch(setLoadingPartial(false));

      if (isForDetail) {
        return updatedTaskRes.data;
      }
    } catch (err) {
      dispatch(
        setErrorMsgs(
          err.response &&
            err.response.data &&
            err.response.status !== 404 &&
            err.response.data.error_msg
            ? err.response.data.error_msg
            : ["Oops, une erreur inattendue s'est produite"]
        )
      );

      dispatch(setLoadingPartial(false));
    }
  };

export const addSubtask = (formData, motherTaskId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const newSubtaskRes = await axios.post(
      `/api/tasks/add_subtask_to_task/${motherTaskId}`,
      formData,
      config
    );

    dispatch({ type: ADD_SUBTASK, payload: newSubtaskRes.data });

    dispatch(setLoading(false));

    return newSubtaskRes;
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoading(false));
  }
};

export const deleteSubtask = (idToDelete) => async (dispatch) => {
  try {
    dispatch(setLoadingPartial(true));

    const subtakToDelete = await axios.delete(
      `/api/tasks/delete_subtask/${idToDelete}`,
      config
    );

    dispatch({ type: DELETE_SUBTASK, payload: subtakToDelete.data });

    dispatch(setLoadingPartial(false));

    return { success: true, msg: subtakToDelete.data.msg };
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));

    return { success: false, error_msg: err.response.data.error_msg };
  }
};

export const finishSubtask = (idToFinish, motherTaskId) => async (dispatch) => {
  try {
    const subtaskToFinish = await axios.patch(
      `/api/tasks/finish_subtask/${idToFinish}`,
      config
    );

    return {
      success: true,
      msg: subtaskToFinish.data.msg,
      finishedSubtask: subtaskToFinish.data.finishedSubtask,
    };
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));
    return { success: false, error_msg: err.response.data.error_msg };
  }
};

export const unfinishSubtask = (idToUnfinish) => async (dispatch) => {
  try {
    const subtaskToUnfinish = await axios.patch(
      `/api/tasks/unfinish_subtask/${idToUnfinish}`,
      config
    );

    return {
      success: true,
      msg: subtaskToUnfinish.data.msg,
      unfinishedSubtask: subtaskToUnfinish.data.unfinishedSubtask,
    };
  } catch (err) {
    dispatch(setLoadingPartial(false));
    return { success: false, error_msg: err.response.data.error_msg };
  }
};

/////////////////
// COLLECTIONS
/////////////////

// Load user's collections
export const loadUserCollections = () => async (dispatch) => {
  try {
    dispatch(setLoadingPartial(true));

    const loadCollectionsRes = await axios.get(
      "/api/collections/get_all_collections"
    );

    const collections = loadCollectionsRes.data.collections;
    const msg = loadCollectionsRes.data.msg;

    dispatch({ type: LOAD_COLLECTIONS, payload: { collections, msg } });

    dispatch(setLoadingPartial(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));
  }
};

export const createCollection = (formData) => async (dispatch) => {
  try {
    dispatch(setLoadingPartial(true));

    const newCollectionRes = await axios.post(
      "/api/collections/create_collection",
      formData,
      config
    );

    dispatch({ type: ADD_NEW_COLLECTION, payload: newCollectionRes.data });

    dispatch(setLoadingPartial(false));
  } catch (err) {
    dispatch(
      setErrorMsgs(
        err.response &&
          err.response.data &&
          err.response.status !== 404 &&
          err.response.data.error_msg
          ? err.response.data.error_msg
          : ["Oops, une erreur inattendue s'est produite"]
      )
    );

    dispatch(setLoadingPartial(false));
  }
};

export const removeFromCollection = (updatedCollection) => (dispatch) => {
  dispatch({ type: REMOVE_FROM_COLLECTION, payload: updatedCollection });
};

export const addToCollection = (updatedCollection) => (dispatch) => {
  dispatch({ type: ADD_TO_COLLECTION, payload: updatedCollection });
};

// MESSAGES
export const setErrorMsgs = (error_msgs) => (dispatch) => {
  dispatch({ type: SET_ERROR_MSGS, payload: [...error_msgs] });
};

export const deleteIndividualErrorMsg = (error_msg_id) => (dispatch) => {
  dispatch({ type: DELETE_INDIVIDUAL_ERROR_MSG, payload: error_msg_id });
};

export const deleteAllErrorMsg = () => (dispatch) => {
  dispatch({ type: DELETE_ALL_ERROR_MSG });
};

export const setMessages = (messages) => (dispatch) => {
  dispatch({ type: SET_MESSAGES, payload: messages });
};

export const deleteIndividualMessage = (message_key) => (dispatch) => {
  dispatch({ type: DELETE_INDIVIDUAL_MSG, payload: message_key });
};

export const deleteAllMessages = () => (dispatch) => {
  dispatch({ type: DELETE_ALL_MSG });
};
