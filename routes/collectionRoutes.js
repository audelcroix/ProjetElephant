const router = require("express").Router();
const collectionController = require("../controllers/collectionController");

const { body } = require("express-validator");

const { protect } = require("../middlewares/auth");

router
  .route("/create_collection")
  .post(
    protect,
    body("title")
      .trim()
      .escape()
      .isLength({ min: 3, max: 140 })
      .withMessage("Le titre doit comporter entre 3 et 140 caractères"),
    body("description")
      .trim()
      .escape()
      .isLength({ min: 3, max: 500 })
      .withMessage("La description doit comporter entre 3 et 500 caractères"),
    collectionController.createCollection
  );

router
  .route("/delete_collection/:collectionId")
  .delete(protect, collectionController.deleteCollection);

router
  .route("/update_collection/:collectionId")
  .patch(
    protect,
    body("title")
      .trim()
      .escape()
      .isLength({ min: 3, max: 140 })
      .withMessage("Le titre doit comporter entre 3 et 140 caractères"),
    body("description")
      .trim()
      .escape()
      .isLength({ min: 3, max: 500 })
      .withMessage("La description doit comporter entre 3 et 500 caractères"),
    collectionController.editCollection
  );

router
  .route("/get_collection_complete/:collectionId")
  .get(protect, collectionController.getCollectionComplete);

router
  .route("/get_all_collections")
  .get(protect, collectionController.getUserCollection);

module.exports = router;
