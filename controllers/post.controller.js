const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");

const postController = {};

const calcualtePostCount = async (userId) => {
  const postCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { postCount });
};

postController.createNewPost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { content, image } = req.body;

  let post = await Post.create({
    content,
    image,
    author: currentUserId,
  });

  await calcualtePostCount(currentUserId);

  post = await post.populate("author");

  sendResponse(res, 200, true, post, null, "Create Post Success");
});

postController.updateSinglePost = catchAsync(async (req, res, next) => {
  //getdata
  const currentUserId = req.userId;
  const postId = req.params.id;

  // Business Logic Validation

  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, "Post not found", "Update Post Error");
  if (!post.author.equals(currentUserId))
    throw new AppError(400, "Only Author can edit post", "Update Post Error");

  // Process
  const allows = ["content", "image"];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });
  await post.save();

  // Response
  sendResponse(res, 200, true, post, null, "Update Post Successfull");
});
postController.deleteSinglePost = catchAsync(async (req, res, next) => {
  //getdata
  const currentUserId = req.userId;
  const postId = req.params.id;

  // Business Logic Validation

  let post = await Post.findOneAndUpdate(
    { _id: postId, author: currentUserId },
    { isDeleted: true },
    { new: true }
  );
  if (!post)
    throw new AppError(
      400,
      "Post Not Found or User not authorization",
      "Delete Post Error"
    );

  // Process
  await calcualtePostCount(currentUserId);

  // Response
  sendResponse(res, 200, true, post, null, "Delete Post Successfull");
});

postController.getSinglePost = catchAsync(async (req, res, next) => {
  //getdata
  const currentUserId = req.userId;
  const postId = req.params.id;

  // Business Logic Validation
  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, "Post not found", "Get Single Post Error");

  // Process
  post = post.toJSON();
  post.comments = await Comment.find({ post: post._id }).populate("author");
  // Response
  sendResponse(res, 200, true, post, null, "Get Single Post Successful");
});

postController.getPosts = catchAsync(async (req, res, next) => {
  // const currentUserId = req.userId;
  const userId = req.params.userId;
  let { page, limit } = { ...req.query };

  let user = await User.findById(userId);
  if (!user) throw new AppError(400, "User not found", "Get Posts Error");

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 2;

  let userFriendIDs = await Friend.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  if (userFriendIDs && userFriendIDs.length) {
    userFriendIDs = userFriendIDs.map((friend) => {
      if (friend.from._id.equals(userId)) return friend.to;
      return friend.from;
    });
  } else {
    userFriendIDs = [];
  }

  userFriendIDs = [...userFriendIDs, userId];
  console.log(userFriendIDs);

  const filterConditions = [
    { isDeleted: false },
    { author: { $in: userFriendIDs } },
  ];
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Post.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const posts = await Post.find(filterCrireria)
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  sendResponse(res, 200, true, { posts, totalPages, count }, null, "");
});

postController.getCommentOfPost = catchAsync(async (req, res, next) => {
  // const currentUserId = req.userId;
  const postId = req.params.id;
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  //validate post exists

  const post = Post.findById(postId);
  if (!post) throw new AppError(400, "Post Not Found ", "get comment Error");
  //get comment
  const count = await Comment.countDocuments({ post: postId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const comments = await Comment.find({ post: postId })
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");
  //sendResponse
  sendResponse(
    res,
    200,
    true,
    { comments, totalPages, count },
    null,
    "GET COMMENTS SUCCESS"
  );
});

module.exports = postController;
