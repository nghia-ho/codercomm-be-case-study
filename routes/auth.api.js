const express = require("express");
const { route } = require("./user.api");
const router = express.Router();
const { loginWithEmail } = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validators");
const { body } = require("express-validator");

/**
 * @route POST /auth/login
 * @description Log in with username and password
 * @body { email, password}
 * @access Public
 */
router.post(
  "/login",
  validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  loginWithEmail
);

module.exports = router;
