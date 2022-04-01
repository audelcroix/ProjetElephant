const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const { handleMongooseDocCreationError } = require("./../utils/utils");

const { validationResult } = require("express-validator");

// Not used
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({
      error_msg: [
        "Oops! Une erreur interne s'est produite lors du chargement des utilisateurs...",
      ],
    });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    const newUser = new User({
      password,
      username,
      email,
    });

    newUser.save((err, newUser) => {
      if (err) {
        let errorToReturn = handleMongooseDocCreationError(
          err,
          ["email", "username"],
          "Oops! Une erreur interne est survenue lors de la création de votre profil"
        );

        return res
          .status(errorToReturn.code)
          .json({ error_msg: errorToReturn.error_msg });
      }

      const token = jwt.sign(
        { user: { id: newUser._id } },
        process.env.TOKEN_SECRET_KEY,
        {
          expiresIn: 24 * 60 * 60 * 1000,
        }
      );

      return res.status(200).json({ token, user: newUser });
    });
  } catch (err) {
    if (err.error_msg) {
      res.status(401).json({ error_msg: [...err.error_msg] });
    } else {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne s'est produite lors de la connexion...",
        ],
      });
    }
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();

      let error_msg = [];

      errors.forEach((el) => {
        error_msg.push(el.msg);
      });

      throw { error_msg };
    }

    /* if (!email) {
      throw { error_msg: "Veuillez entrer un email" };
    }

    if (!password) {
      throw { error_msg: "Veuillez entrer un mot de passe" };
    } */
    console.log(email, password);
    const user = await User.findOne({ email });

    if (!user) {
      throw { error_msg: "Cet email n'est pas reconnu" };
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      throw { error_msg: "Ce mot de passe est invalide" };
    }

    // Security measure, so it won't be seen in the front end
    delete user.password;

    const token = jwt.sign(
      { user: { id: user._id } },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: 24 * 60 * 60 * 1000,
      }
    );

    //res.cookie("jwt", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.status(200).json({ token, user });
  } catch (err) {
    if (err.error_msg) {
      res.status(401).json({ error_msg: [err.error_msg] });
    } else {
      return res.status(500).json({
        error_msg: [
          "Oops! Une erreur interne s'est produite lors de la connexion...",
        ],
      });
    }
  }
};

exports.logoutUser = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({ msg: "Déconnexion réussie" });
};
