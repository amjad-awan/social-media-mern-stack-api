const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // ✅ THIS WAS MISSING
      required: true,
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
   required: false,  // ✅ make image optional

  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Post", postSchema);
