const Notification = require("../Modals/notification");
const PostModel = require("../Modals/postModel"); // Make sure this path is correct

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { senderId, postId, type } = req.body;

    if (!senderId || !postId || !type) {
      return res.status(400).json({ success: false, message: "senderId, postId, and type are required" });
    }

    // Get the post to find the owner
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Do not notify self
    if (post.userId.toString() === senderId) {
      return res.status(200).json({ success: true, message: "No notification for self" });
    }

    // Prepare message
    let message = type === "like" ? "liked your post" : "commented on your post";

    // Create notification
    const notification = await Notification.create({
      userId: post.userId, // recipient
      senderId,
      postId,
      type,
      message,
    });

    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).json({ success: false, message: "Failed to create notification", error: err });
  }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .populate("senderId", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications", error: err });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });

    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark As Read Error:", err);
    res.status(500).json({ success: false, message: "Failed to update notification", error: err });
  }
};
