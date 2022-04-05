const router = require("express").Router();
const userController = require("../controllers/userController");

const { body } = require("express-validator");

router.route("/register").post(
  body("email")
    .isEmail()
    .withMessage("Cet email est invalide")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Votre mot de passe doit comporter au moins 6 caractères")
    .matches(/^(?=.*\d)(?=.*[A-Za-z])[0-9a-zA-Z]{6,}$/, "i")
    .withMessage(
      "Votre mot de passe doit comporter au moins un chiffre et une lettre"
    )
    .escape(),
  userController.registerUser
);

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
