const ChatModel = require("../Modals/chatModel");


// Create a new chat or return existing one
const createChat = async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "senderId and receiverId are required" });
  }

  try {
    // Check if chat already exists
    let chat = await ChatModel.findOne({
      members: { $all: [senderId, receiverId] },
    }).populate("members", "_id firstname lastname username profilePictureId");

    if (!chat) {
      chat = await ChatModel.create({ members: [senderId, receiverId] });
      chat = await chat.populate("members", "_id firstname lastname username profilePictureId");
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Create chat error:", err);
    res.status(500).json({ message: "Failed to create chat", error: err.message });
  }
};

// Get all chats of a user
const getUserChats = async (req, res) => {
  const userId = req.params.userId;

  try {
    const chats = await ChatModel.find({
      members: userId,
    })
      .sort({ updatedAt: -1 })
      .populate("members", "_id firstname lastname username profilePictureId lastSeen isOnline");

    res.status(200).json(chats);
  } catch (err) {
    console.error("Get chats error:", err);
    res.status(500).json({ message: "Failed to fetch chats", error: err.message });
  }
};

module.exports = { createChat, getUserChats };
