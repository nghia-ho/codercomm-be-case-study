const express = require("express");
const { body, param } = require("express-validator");
const postController = require("../controllers/post.controller");
const authentication = require("../middlewares/authentication");
const { checkObjectId } = require("../middlewares/validators");
const validators = require("../middlewares/validators");
const router = express.Router();

/**
 * @route GET /posts/user/:userId?page=1&Limit=10
 * @description Get all posts an user can see with pagination
 * @access Login required
 */
router.get(
  "/user/:userId",
  validators.validate([
    param("userId").exists().isString().custom(checkObjectId),
  ]),
  postController.getPosts
);
/**
 * @route POST /posts
 * @description Create a new post
 * @body {content, image}
 * @access Login required
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([body("content", "Missing Content").exists().notEmpty()]),
  postController.createNewPost
);
/**
 * @route PUT /posts/:id
 * @description Update a post
 * @body {content, image}
 * @access Login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([param("id").exists().isString().custom(checkObjectId)]),
  postController.updateSinglePost
);

/**
 * @route DELETE /posts/:id
 * @description Delete a post
 * @access Login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([param("id").exists().isString().custom(checkObjectId)]),
  postController.deleteSinglePost
);
/**
 * @route GET /posts/:id
 * @description Get a single post
 * @access Login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([param("id").exists().isString().custom(checkObjectId)]),
  postController.getSinglePost
);

/**
 * @route GET posts/:id/comments
 * @description Get comments of a post
 * @access Login required
 */
router.get(
  "/:id/comments",
  authentication.loginRequired,
  validators.validate([param("id").exists().isString().custom(checkObjectId)]),
  postController.getCommentOfPost
);

module.exports = router;
