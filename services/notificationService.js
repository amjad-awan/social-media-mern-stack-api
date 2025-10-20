const Notification = require("../Modals/notification");

/**
 * Send notification and emit via socket
 */
const sendNotification = async ({ userId, senderId, postId, type, message, app }) => {
  // 1️⃣ Create the notification
  const newNotification = await Notification.create({
    userId,
    senderId,
    postId,
    type,
    message,
  });

  // 2️⃣ Populate senderId and userId
  const populatedNotification = await Notification.findById(newNotification._id)
    .populate("senderId", "_id username email profilePicture") // sender details
    .populate("userId", "_id username"); // recipient details, optional

  // 3️⃣ Emit via socket if online using populated object
  const io = app.get("io");
  const onlineUsers = app.get("onlineUsers");
  const recipientSocketId = onlineUsers.get(userId.toString());

  if (recipientSocketId) {
    io.to(recipientSocketId).emit("newNotification", populatedNotification);
    console.log("Notification emitted to socket:", recipientSocketId);
  }

  return populatedNotification;
};

module.exports = { sendNotification };
