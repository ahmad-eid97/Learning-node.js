const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const isNotAuthenticated = require("../middleware/isNotAuth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", isNotAuthenticated, authController.getLogin);

router.get("/signup", isNotAuthenticated, authController.getSignup);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("Invalid email or password");
          }
          return true;
        });
      }),
    body("password", "Password has to be valid.")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  isNotAuthenticated,
  authController.postLogin,
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .custom((value, { req }) => {
        // if (value === "test@example.com") {
        //   throw new Error("This email is not allowed.");
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one.",
            );
          }
          return true;
        });
      }),
    body(
      "password",
      "Password must be at least 6 characters long and contain only letters and numbers.",
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  isNotAuthenticated,
  authController.postSignup,
);

router.post("/logout", authController.postLogout);

router.get("/reset", isNotAuthenticated, authController.getReset);

router.post("/reset", isNotAuthenticated, authController.postReset);

router.get("/reset/:token", isNotAuthenticated, authController.getNewPassword);

router.post(
  "/new-password",
  isNotAuthenticated,
  authController.postNewPassword,
);

module.exports = router;
