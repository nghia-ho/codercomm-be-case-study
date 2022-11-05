const { mongoose } = require("mongoose");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Reaction = require("../models/Reaction");

const reactionController = {};

const calcualteReaction = async (targetId, targetType) => {
  const stat = await Reaction.aggregate([
    {
      $match: { targetId: mongoose.Types.ObjectId(targetId) },
    },
    {
      $group: {
        _id: "$targetId",
        like: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "like"] }, 1, 0],
          },
        },
        dislike: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "dislike"] }, 1, 0],
          },
        },
      },
    },
  ]);
  const reactions = {
    like: (stat[0] && stat[0].like) || 0,
    dislike: (stat[0] && stat[0].dislike) || 0,
  };
  await mongoose.model(targetType).findByIdAndUpdate(targetId, { reactions });
  return stat;
};

reactionController.saveReaction = catchAsync(async (req, res, next) => {
  const { targetType, targetId, emoji } = req.body;
  const currentUerId = req.userId;
  //check target Type exists

  const targetObj = await mongoose.model(targetType).findById(targetId);

  if (!targetObj)
    throw new AppError(400, `${targetId} not found`, "Create Reaction error");

  //Find the reaction if exist
  let reaction = await Reaction.findOne({
    targetType,
    targetId,
    author: currentUerId,
  });
  //if there is no reaction in the db => create new one
  if (!reaction) {
    await Reaction.create({
      targetType,
      targetId,
      author: currentUerId,
      emoji,
    });
  } else {
    //if there is a previous reaction in db => compare the emojis
    if (reaction.emoji === emoji) {
      //if they are the same => delete the reaction
      await reaction.delete();
    } else {
      //if they are different => update the reaction
      reaction.emoji = emoji;
      await reaction.save();
    }
  }

  const reactions = await calcualteReaction(targetId, targetType);

  return sendResponse(
    res,
    200,
    true,
    reactions,
    null,
    "Save reaction successfully"
  );
});

module.exports = reactionController;
