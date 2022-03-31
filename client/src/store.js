import { createStore, applyMiddleware } from "redux";
import { persistStore } from "redux-persist";
import thunk from "redux-thunk";

import rootReducer from "./reducers";

const middleware = [thunk];

export const store = createStore(rootReducer, applyMiddleware(...middleware));

// for redux persist
export const persistor = persistStore(store);

// eslint-disable-next-line
export default { store, persistor };
