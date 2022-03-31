import React, { useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { logout, changeMode } from "../../actions/userActions";

const Navbar = () => {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [isActive, setisActive] = useState(false);

  const logOut = () => {
    dispatch(logout());
  };

  return (
    <div>
      <nav
        className='navbar is-info'
        role='navigation'
        aria-label='main navigation'
      >
        <div className='navbar-brand'>
          {/* <a className="navbar-item" href="https://bulma.io">
      <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28" />
    </a> */}

          <a
            onClick={() => {
              setisActive(!isActive);
            }}
            role='button'
            className={`navbar-burger burger ${isActive ? "is-active" : ""}`}
            aria-label='menu'
            aria-expanded='false'
            data-target='navbarBasicExample'
          >
            <span aria-hidden='true'></span>
            <span aria-hidden='true'></span>
            <span aria-hidden='true'></span>
          </a>
        </div>

        <div
          id='navMenu'
          className={`navbar-menu ${isActive ? "is-active" : ""}`}
        >
          <div className='navbar-start'>
            <a
              className='navbar-item'
              onClick={() => {
                dispatch(changeMode("TASKS"));
              }}
            >
              Mes Tâches
            </a>

            <a
              className='navbar-item'
              onClick={() => {
                dispatch(changeMode("NOTES"));
              }}
            >
              Mes Notes
            </a>

            <a
              className='navbar-item'
              onClick={() => {
                dispatch(changeMode("PROCESSES"));
              }}
            >
              Mes Processus
            </a>

            <a
              className='navbar-item'
              onClick={() => {
                dispatch(changeMode("COLLECTIONS"));
              }}
            >
              Mes Collections
            </a>
          </div>

          <div className='navbar-end'>
            <div className='navbar-item'>
              <div className='buttons'>
                <a className='button is-dark' onClick={logOut}>
                  Déconnexion
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
