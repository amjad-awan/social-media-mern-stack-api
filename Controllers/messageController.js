const MessageModel = require("../Modals/messageModel");

/**
 * Send message via API
 */
const sendMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  if (!chatId || !senderId || !text) {
    return res.status(400).json({ message: "chatId, senderId, and text are required" });
  }

  try {
    // Just save and return message (no socket)
    const newMessage = await MessageModel.create({ chatId, senderId, text });
    res.status(200).json(newMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
};

/**
 * Get all messages of a chat
 */
const getChatMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await MessageModel.find({ chatId }).sort({ createdAt: 1 })
      .populate("senderId", "_id firstname lastname username profilePictureId");
    res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};

module.exports = { sendMessage, getChatMessages };
