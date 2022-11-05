const express = require("express");
const router = express.Router();
const {
  register,
  getUsers,
  getCurrentUser,
  getSingleUser,
  updateProfile,
} = require("../controllers/user.controller");
const { body, param } = require("express-validator");
const { validate, checkObjectId } = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

/**
 * @route POST /users
 * @description Register new user
 * @body {name, enail, password)
 * @access Public
 */
router.post(
  "/",
  validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  register
);

/**
 * @route GET /users?page=1&limit=10
 * @description Get users with pagination
 * @access Login required
 */
router.get("/", authentication.loginRequired, getUsers);

/**
 * @route GET /users/me
 * @description Get current user info
 * @access Login required
 */
router.get("/me", authentication.loginRequired, getCurrentUser);

/**
 * @route GET /users/:id
 * @description Get a user profile
 * @access Login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),
  getSingleUser
);

/**
* @route PUT /users/:id
* @description Update user profile
* @body name, avatarUrl, coverUrl, aboutMe, city, country, company  ,
jobTitle, facebookLink, ins tagramLink, LinkedinLink, twitterLink )
* @access Login required
*/
router.put(
  "/:id",
  authentication.loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),

  updateProfile
);

module.exports = router;
