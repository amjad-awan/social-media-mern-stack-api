const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: String, // sending from frontend as string
    required: true
  },
  desc: {
    type: String
  },
  likes: {
    type: Array,
    default: []
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Post", postSchema);
