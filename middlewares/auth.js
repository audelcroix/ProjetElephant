const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  // Extract token itself

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("ElephantJWToken") // "ElephantJWToken" comes from the front end
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      error_msg: "Désolé, vous devez vous connecter pour voir cette page",
    });
  }

  // 2) Verification token

  jwt.verify(token, process.env.TOKEN_SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(401).json({
        error_msg:
          "Nous sommes désolés, une erreur interne est survenue lors du chargement de la page. Essayez de vous déconnecter et de vous reconnecter",
      });
    }

    // 3) Check if user still exists
    // user is nested in the json sent back to here
    const currentUser = await User.findById(user.user.id).select("-password");

    // Check if token was not altered
    if (!currentUser) {
      return res
        .status(401)
        .json({ error_msg: "Il semble que votre profil n'existe plus" });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  });
};
