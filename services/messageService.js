const MessageModel = require("../Modals/messageModel");
const ChatModel = require("../Modals/chatModel");

const sendMessageSocket = async ({ chatId, senderId, text, app }) => {
  try {
    // 1️⃣ Save message
    const newMessage = await MessageModel.create({ chatId, senderId, text });

    // 2️⃣ Update Chat lastMessage + unread count
    const chat = await ChatModel.findById(chatId);

    chat.lastMessage = text;
    chat.updatedAt = Date.now();

    // ✅ Increase unread for other members
    chat.members.forEach((memberId) => {
      const id = memberId.toString();
      if (id !== senderId) {
        const current = chat.unReadCount.get(id) || 0;
        chat.unReadCount.set(id, current + 1);
      }
    });

    await chat.save();

    // 3️⃣ Populate message
    const populatedMessage = await MessageModel.findById(newMessage._id)
      .populate("senderId", "_id firstname lastname username profilePictureId");

    // 4️⃣ Emit real-time
    if (app) {
      const io = app.get("io");
      const onlineUsers = app.get("onlineUsers");

      chat.members.forEach((memberId) => {
        const socketId = onlineUsers.get(memberId.toString());
        if (socketId) io.to(socketId).emit("newMessage", populatedMessage);
      });
    }

    return populatedMessage;
  } catch (err) {
    console.error("Socket sendMessage error:", err);
    throw err;
  }
};

module.exports = { sendMessageSocket };
