exports.handleMongooseDocCreationError = (
  err,
  thingsToCheck = [],
  defaultMsg = "Oops! Une erreur interne est survenue"
) => {
  let error_msg = [];

  if (err.errors) {
    thingsToCheck.forEach((element) => {
      if (err.message.includes(element)) {
        error_msg.push(err.errors[element].message);
      }
    });
  }

  console.log(err, err.errors);

  if (err.error_msg && err.error_msg.length >= 1) {
    err.error_msg.forEach((el) => {
      error_msg.push(el);
    });
  }

  if (error_msg.length < 1 && err.name === "ValidationError") {
    error_msg.push("Une erreur inattendue s'est produite lors de la");
  }

  // To catch doubles in user registration
  if (err.code && err.code === 11000) {
    if (Object.keys(err.keyValue)[0].includes("username")) {
      error_msg.push("Ce nom d'utilisateur est déjà utilisé");
    }

    if (Object.keys(err.keyValue)[0].includes("email")) {
      error_msg.push("Cet email est déjà utilisé");
    }
  }

  if (error_msg.length < 1) {
    return {
      code: 500,
      error_msg: [defaultMsg],
    };
  } else {
    return { code: 400, error_msg };
  }
};
