const Comment = require("../Modals/comment");
const Notification = require("../Modals/notification");
const PostModel = require("../Modals/postModel"); // Make sure this path is correct
const { sendNotification } = require("../services/notificationService");


const addComment = async (req, res) => {
  try {
    const { postId, userId, comment } = req.body;

    if (!postId || !userId || !comment) {
      return res.status(400).json({ message: "postId, userId, and comment are required" });
    }

    const newComment = new Comment({ postId, userId, comment });
    await newComment.save();

    const post = await PostModel.findById(postId);

    if (post && post.userId.toString() !== userId) {
      await sendNotification({
        userId: post.userId, // recipient
        senderId: userId,    // commenter
        postId,
        type: "comment",
        message: "commented on your post",
        app: req.app,
      });
    }

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Add Comment Error:", err);
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
};



// Get comments for a post
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ postId })
      .populate("userId", "firstname lastname profilePictureId")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error("Fetch Comments Error:", err);
    res.status(500).json({ message: "Failed to fetch comments", error: err.message });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete Comment Error:", err);
    res.status(500).json({ message: "Failed to delete comment", error: err.message });
  }
};

module.exports = { addComment, getComments, deleteComment };
