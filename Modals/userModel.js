const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profilePictureId: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
  coverPictureId: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
  livesin: String,
  worksAt: String,
  country: String,
  relationship: String,
  followers: [],
  following: []
}, { timestamps: true });

const UserModel = mongoose.model("Users", userSchema);
module.exports = UserModel;
