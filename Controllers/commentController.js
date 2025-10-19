const Comment = require("../Modals/comment");

const addComment = async (req, res) => {
  try {
    const { postId, userId, comment } = req.body;
    const newComment = new Comment({ postId, userId, comment });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Add Comment Error:", err);
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    console.log("PostId Received:", postId);

    const comments = await Comment.find({ postId })
      .populate("userId", "firstname lastname profilePictureId")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error("Fetch Comments Error:", err);
    res.status(500).json({ message: "Failed to fetch comments", error: err.message });
  }
};

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
