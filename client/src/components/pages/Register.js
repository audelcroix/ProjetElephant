import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { register, setErrorMsgs } from "./../../actions/userActions";

import ErrorMsgBoard from "../parts/ErrorMsgBoard";
import MessageBoard from "../parts/MessageBoard";

const Register = (props) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // redirect to homepage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      props.history.push("/");
    }
  }, [isAuthenticated, props.history]);

  const emailIsValid = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const [userToRegister, setUserToRegister] = useState({
    password: "",
    passwordConfirm: "",
    email: "",
    username: "",
  });

  const handleRegisterFormChange = (event) => {
    setUserToRegister({
      ...userToRegister,
      [event.target.name]: event.target.value,
    });
  };

  const handleRegisterFormSubmit = (event) => {
    event.preventDefault();

    if (!emailIsValid(userToRegister.email)) {
      dispatch(setErrorMsgs(["Email invalide", "grudu"]));
    } else if (userToRegister.password.length < 8) {
      dispatch(
        setErrorMsgs(["Le mot de passe doit comporter au moins 8 caractères"])
      );
    } else if (userToRegister.password !== userToRegister.passwordConfirm) {
      dispatch(setErrorMsgs(["Les deux mots de passe doivent être les mêmes"]));
    } else {
      dispatch(
        register({
          password: userToRegister.password,
          username: userToRegister.username,
          email: userToRegister.email,
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
          <p className='subtitle'>Inscription</p>
        </div>

        <div className='column is-full'>
          <MessageBoard />
          <ErrorMsgBoard />
        </div>

        <div className='box'>
          <div className='block mt-5'>
            <form onSubmit={handleRegisterFormSubmit}>
              <div className='field'>
                <label className='label'>Nom d'utilisateur</label>

                <p className='control has-icons-left'>
                  <input
                    placeholder="Nom d'utilisateur"
                    className='input is-medium is-info'
                    type='text'
                    value={userToRegister.username}
                    onChange={handleRegisterFormChange}
                    name='username'
                  />
                  <span className='material-icons icon is-small is-left'>
                    person
                  </span>
                </p>
              </div>

              <div className='field'>
                <label className='label'>E-Mail</label>
                <p className='control has-icons-left'>
                  <input
                    placeholder='E-Mail'
                    className='input is-medium is-info'
                    type='email'
                    value={userToRegister.email}
                    onChange={handleRegisterFormChange}
                    name='email'
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
                    placeholder='Mot de passe'
                    className='input is-medium is-info'
                    type='password'
                    value={userToRegister.password}
                    onChange={handleRegisterFormChange}
                    name='password'
                  />
                  <span className='material-icons icon is-small is-left'>
                    lock
                  </span>
                </p>
              </div>

              <div className='field'>
                <label className='label'>Confirmation du mot de passe</label>
                <p className='control has-icons-left'>
                  <input
                    placeholder='Confirmation du mot de passe'
                    className='input is-medium is-info'
                    type='password'
                    value={userToRegister.passwordConfirm}
                    onChange={handleRegisterFormChange}
                    name='passwordConfirm'
                  />
                  <span className='material-icons icon is-small is-left'>
                    lock
                  </span>
                </p>
              </div>

              <div className='control'>
                <button type='submit' className='button is-link'>
                  Créer mon profil
                </button>
              </div>
            </form>
          </div>

          <Link to={"/login"} className='has-text-weight-medium'>
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
