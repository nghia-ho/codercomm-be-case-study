const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendSchema = Schema(
  {
    // [userFrom] User me sent request to
    from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    // [userTo] receive and response a request with accept or decline
    to: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    // start with pending and userTo response a request with accept or decline
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
    },
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);
module.exports = Friend;
