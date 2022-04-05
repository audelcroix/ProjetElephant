import React, { useEffect } from "react";

import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";

import "bulma/css/bulma.min.css";
import "./styles/styles.css";
//Components
import PrivateRoute from "./components/routes/PrivateRoute";

import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import TaskDetail from "./components/pages/TaskDetail";
import ProcessDetail from "./components/pages/ProcessDetail";
import CollectionDetail from "./components/pages/CollectionDetail";
import NoteDetail from "./components/pages/NoteDetail";

// Utils
import setAuthToken from "./utils/setAuthToken";

// REDUX
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";

function App() {
  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
  });

  return (
    <Provider store={store}>
      <div className='main has-background-light'>
        <Router>
          <PersistGate persistor={persistor}>
            <Switch>
              <PrivateRoute exact path='/' component={Home} />

              <Route exact path='/login' component={Login} />

              <Route exact path='/register' component={Register} />

              <PrivateRoute exact path='/task/:taskId' component={TaskDetail} />

              <PrivateRoute
                exact
                path='/process/:processId'
                component={ProcessDetail}
              />

              <PrivateRoute exact path='/note/:noteId' component={NoteDetail} />

              <PrivateRoute
                exact
                path='/collection/:collectionId'
                component={CollectionDetail}
              />

              <Redirect to='/' />
            </Switch>
          </PersistGate>
        </Router>
      </div>
    </Provider>
  );
}

export default App;
