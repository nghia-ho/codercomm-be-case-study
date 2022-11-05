const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/User");
const Friend = require("../models/Friend");
const bcrypt = require("bcryptjs");

const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  // Get data from request
  let { name, email, password } = req.body;

  // Business Logic Validation
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "User already existed", "Registration Error");

  // Process
  const salt = await bcrypt.genSalt(10);

  // hash password with hash func
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });
  const accessToken = await user.generateToken();

  // Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create User Successfull"
  );
});

userController.getUsers = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 2;

  const filterCondition = [{ isDeleted: false }];
  const filterCriteria = filterCondition.length
    ? { $and: filterCondition }
    : {};
  const count = await User.countDocuments(filter);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const users = await User.find(filterCriteria)
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit);

  const promises = users.map(async (user) => {
    let temp = user.toJSON();
    temp.friendship = await Friend.findOne({
      $or: [
        { from: currentUserId, to: user._id },
        { to: user._id, to: currentUserId },
      ],
    });
    return temp;
  });

  const userWithFriendShip = await Promise.all(promises);

  sendResponse(
    res,
    200,
    true,
    { users: userWithFriendShip, totalPages },
    null,
    "Get Users Successful"
  );
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  //Get data
  const currentUserId = req.userId;
  // bussiness logic
  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(400, "User not found", "Get Current User Error");

  // Response
  sendResponse(res, 200, true, user, null, "Get Current User Successful");
});

userController.getSingleUser = catchAsync(async (req, res, next) => {
  //getdata
  const currentUserId = req.userId;
  const userId = req.params.id;

  // Business Logic Validation
  let user = await User.findById(userId);
  if (!user) throw new AppError(400, "User not found", "Get Single User Error");

  // Process
  user = user.toJSON();
  user.friendship = await Friend.findOne({
    $or: [
      { from: currentUserId, to: user._id },
      { to: user._id, to: currentUserId },
    ],
  });

  // Response
  sendResponse(res, 200, true, user, null, "Get Single User Successful");
});
userController.updateProfile = catchAsync(async (req, res, next) => {
  //getdata
  const currentUserId = req.userId;
  const userId = req.params.id;

  // Business Logic Validation
  if (currentUserId !== userId)
    throw new AppError(400, "Permission Required", "Update User Error");
  let user = await User.findById(userId);
  if (!user) throw new AppError(400, "User not found", "Update User Error");

  const allows = [
    "name",
    "avatarUrl",
    "coverUrl",
    "aboutMe",
    "city",
    "country",
    "company",
    "Jobtitle",
    "facebookLink",
    "InstagramLink",
    "linkedinLink",
    "twitterLink",
  ];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();

  // Process

  // Response
  sendResponse(res, 200, true, user, null, "Update User Successfull");
});

module.exports = userController;
