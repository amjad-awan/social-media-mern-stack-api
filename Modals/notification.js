const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // user who receives notification
      ref: "Users",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId, // user who triggered notification
      ref: "Users",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: function () {
        // Only required for like/comment notifications
        return this.type === "like" || this.type === "comment";
      },
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
