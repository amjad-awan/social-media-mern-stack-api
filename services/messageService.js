const MessageModel = require("../Modals/messageModel");
const ChatModel = require("../Modals/chatModel");

const sendMessageSocket = async ({ chatId, senderId, text, app }) => {
  try {
    // 1️⃣ Save message to DB
    const newMessage = await MessageModel.create({ chatId, senderId, text });

    // 2️⃣ Update Chat lastMessage
    await ChatModel.findByIdAndUpdate(chatId, {
      lastMessage: text,
      updatedAt: Date.now()
    });

    // 3️⃣ Populate message for frontend UI
    const populatedMessage = await MessageModel.findById(newMessage._id)
      .populate("senderId", "_id firstname lastname username profilePictureId");

    // 4️⃣ Emit to all online chat members
    if (app) {
      const io = app.get("io");
      const onlineUsers = app.get("onlineUsers");

      const chat = await ChatModel.findById(chatId).select("members");

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
