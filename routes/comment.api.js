const express = require("express");
const { body, param } = require("express-validator");
const commentController = require("../controllers/comment.controller");
const router = express.Router();
const authentication = require("../middlewares/authentication");
const { checkObjectId } = require("../middlewares/validators");
const validators = require("../middlewares/validators");

/**
 * @route POST /comments
 * @description Create a new comment
 * @body {content, postId}
 * @access Login required
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("postId", "Missing postId").exists().custom(checkObjectId),
  ]),
  commentController.createNewComment
);

/**
 * @route PUT /comments/:id
 * @description Update a comment
 * @body {content, postId}
 * @access Login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(checkObjectId),
    body("content", "Missing content").exists().custom(checkObjectId),
  ]),
  commentController.updateSingleComment
);

/**
 * @route DELETE /comments/:id
 * @description Delete a comment
 * @access Login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([param("id").exists().isString().custom(checkObjectId)]),
  commentController.deleteSingleComment
);

/**
 * @route GET /comments/:id
 * @description Get a detail comment
 * @access Login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([param("id").exists().isString().custom(checkObjectId)]),
  commentController.getSingleComment
);

module.exports = router;
