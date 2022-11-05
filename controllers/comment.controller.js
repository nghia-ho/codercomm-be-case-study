const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const commentController = {};

const calcualteCommentCount = async (postId) => {
  const commentCount = await Comment.countDocuments({
    post: postId,
    isDeleted: false,
  });
  await Post.findByIdAndUpdate(postId, { commentCount });
};

commentController.createNewComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { content, postId } = req.body;

  //check post exist
  const post = Post.findById(postId);
  if (!post)
    throw new AppError(400, "Post Not Found", "Create new commnet Error");
  //create new comment
  let comment = await Comment.create({
    author: currentUserId,
    content,
    post: postId,
  });
  //update comment count
  await calcualteCommentCount(postId);
  comment = await comment.populate("author");

  sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Create new Comment successfully"
  );
});
commentController.updateSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;
  const { content } = req.body;
  const comment = await Comment.findByIdAndUpdate(
    { _id: commentId },
    { content },
    { new: true }
  );
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not authorzied",
      "Update Comment Error"
    );
  sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Create new Comment successfully"
  );
});

commentController.getSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;

  let commnet = await Comment.findById(commentId);
  if (!commnet)
    throw new AppError(400, "Comment Not Found", "get  commnet Error");

  sendResponse(res, 200, true, commnet, null, "get  Comment successfully");
});
commentController.deleteSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;

  const comment = await Comment.findByIdAndDelete({
    _id: commentId,
    author: currentUserId,
  });
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not authorzied",
      "Delete Comment Error"
    );
  await calcualteCommentCount(comment.post);
  sendResponse(res, 200, true, comment, null, "Delete  Comment successfully");
});

module.exports = commentController;
