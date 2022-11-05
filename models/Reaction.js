const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reactionSchema = Schema(
  {
    author: { type: String, required: true },
    targetType: { type: String, required: true, enum: ["Post", "Comment"] },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    emoji: {
      type: String,
      required: true,
      enum: ["like", "dislike"],
    },
  },
  { timestamps: true }
);

const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;
