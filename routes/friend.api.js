const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { param, body } = require("express-validator");
const friendController = require("../controllers/friend.controller");

/**
 * @route POST /friends/requests
 * @description User Who logged in, they can send a friend request
 * @body {to: User Id}
 * @access Login required
 */
router.post(
  "/requests",
  authentication.loginRequired, // check login
  validators.validate([
    body("to").exists().isString().custom(validators.checkObjectId), // check exists & String & valid Obj ID of to (UserID)
  ]),
  friendController.sendFriendRequest
);

/**
 * @route PUT /friends/requests/:userId
 * @description User Who logged in, They can Accept/Reject a received pending requests
 * @body {status:'accepted' or 'declined'}
 * @access Login required
 */
router.put(
  "/requests/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    body("status").exists().isString().isIn(["accepted", "declined"]),
  ]),
  friendController.reactFriendRequest
);

/**
 * @route GET /friends/requests/incoming
 * @description User Who logged in, they can get the list of RECEIVED pending requests
 * @access Login required
 */
router.get(
  "/requests/incoming",
  authentication.loginRequired,
  friendController.getReceivedFriendRequestList
);

/**
 * @route GET /friends/requests/outgoing
 * @description User Who logged in, they can get the list of SENT pending requests
 * @access Login required
 */
router.get(
  "/requests/outgoing",
  authentication.loginRequired,
  friendController.getSentFriendRequestList
);

/**
 * @route GET /friends
 * @description Get the list of friends OF user who logged in
 * @access Login required
 */
router.get("/", authentication.loginRequired, friendController.getFriendList);

/**
 * @route DELETE /friends/requests/:userId
 * @description User who logged in, they can Cancel a friend request
 * @access Login required
 */
router.delete(
  "/requests/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.cancelFriendRequest
);

/**
 * @route DELETE /friends/:userId
 * @description User who logged in, they can Remove a friend
 * @access Login required
 */
router.delete(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.removeFriend
);

module.exports = router;
