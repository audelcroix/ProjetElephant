const router = require("express").Router();
const userController = require("../controllers/userController");

const { body } = require("express-validator");
const { default: isEmail } = require("validator/lib/isEmail");

router
  .route("/register")
  .post(
    body("email")
      .isEmail()
      .withMessage("Cet email est invalide")
      .normalizeEmail(),
    body("username").isLength({ min: 3, max: 55 }).trim().escape(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Votre mot de passe doit comporter au moins 6 caractères")
      .matches("[0-9]")
      .withMessage("Votre mot de passe doit comporter au moins un chiffre")
      .matches("[A-Z]")
      .withMessage("Votre mot de passe doit comporter au moins une lettre")
      .escape(),
    userController.registerUser
  );

/* router.route("/register").post(
  body("email")
    .isEmail()
    .withMessage("Cet email est invalide")
    .normalizeEmail(),

  userController.registerUser
); */

router
  .route("/login")
  .post(
    body("email")
      .not()
      .isEmpty()
      .withMessage("Veuillez entrer un email")
      .trim()
      .escape(),
    body("password")
      .not()
      .isEmpty()
      .withMessage("Veuillez entrer un mot de passe")
      .escape(),
    userController.loginUser
  );

router.route("/logout").get(userController.logoutUser);

module.exports = router;
