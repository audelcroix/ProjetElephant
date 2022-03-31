import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import ErrorMsgBoard from "../parts/ErrorMsgBoard";
import MessageBoard from "../parts/MessageBoard";

import { login, setErrorMsgs } from "./../../actions/userActions";

const Login = (props) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const emailIsValid = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // redirect to homepage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      props.history.push("/");
    }
  }, [isAuthenticated, props.history]);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { email, password } = user;

  const handleFormChange = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!email) {
      dispatch(setErrorMsgs(["Veuillez entrer un email"]));
    } else if (!emailIsValid(email)) {
      dispatch(setErrorMsgs(["Cette adresse email est invalide"]));
    } else if (!password) {
      dispatch(setErrorMsgs(["Veuillez entrer un mot de passe"]));
    } else {
      dispatch(
        login({
          email,
          password,
        })
      );
    }
  };

  return (
    <div className='columns'>
      <div className='column is-half is-offset-one-quarter'>
        <div className='hero-body'>
          <p className='title'>Bienvenue sur Projet Éléphant</p>

          <p className='subtitle'>
            <strong>Projet Éléphant</strong> est un site web de démonstration
            par{" "}
            <a
              className='has-text-weight-medium has-text-black-bis'
              href='https://audelcroix.com'
            >
              Aurélien Delcroix
            </a>
          </p>
          <p className='subtitle'>Connexion</p>
        </div>

        <div className='column is-full'>
          <MessageBoard />
          <ErrorMsgBoard />
        </div>

        <div className='box'>
          <div className='block mt-5'>
            <form onSubmit={handleFormSubmit}>
              <div className='field'>
                <label className='label'>E-Mail</label>
                <p className='control has-icons-left'>
                  <input
                    type='email'
                    name='email'
                    value={email}
                    onChange={handleFormChange}
                    className='input is-medium is-info'
                    id='loginFormEmail'
                    placeholder='E-Mail'
                  />
                  <span className='material-icons icon is-small is-left'>
                    email
                  </span>
                </p>
              </div>

              <div className='field'>
                <label className='label'>Mot de passe</label>
                <p className='control has-icons-left'>
                  <input
                    type='password'
                    name='password'
                    value={password}
                    onChange={handleFormChange}
                    className='input is-medium is-info'
                    id='loginFormPassword'
                    placeholder='Mot de passe'
                  />
                  <span className='material-icons icon is-small is-left'>
                    lock
                  </span>
                </p>
              </div>

              <div className='control'>
                <button type='submit' className='button is-link'>
                  Connexion
                </button>
              </div>
            </form>
          </div>

          <Link to={"/register"} className='has-text-weight-medium'>
            Inscription
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
