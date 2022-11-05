const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },

    avatarUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },

    aboutMe: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    company: { type: String, default: "" },
    Jobtitle: { type: String, default: "" },
    facebookLink: { type: String, default: "" },
    InstagramLink: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },
    twitterLink: { type: String, default: "" },

    isDeleted: { type: Boolean, default: false, selected: false },
    friendCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// methods khi tạo account thành công, giá trị trả về client sẽ không bao gồm password và isDeleted
// nhưng database mongoDB vẫn save password và isDeleted
userSchema.methods.toJSON = function () {
  const user = this._doc; // get obj user
  delete user.password;
  delete user.isDeleted;
  return user;
};

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
