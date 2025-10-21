const { Server } = require("socket.io");
const UserModel = require("../Modals/userModel"); // ⬅️ Import User model
const { sendMessageSocket } = require("../services/messageService");

const setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {

    // User joins with their userId
    socket.on("join", async (userId) => {
      if (!userId) return;
    // console.log("userId========", userId);

      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`🟢 User ${userId} is online`);

      // ✅ Update DB (user is now online)
      await UserModel.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: null,
      });

      // ✅ Notify clients
      io.emit("userOnline", { userId });
    });

    // ✅ Typing
    socket.on("typing", ({ chatId, senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", { chatId, senderId });
      }
    });

    // ✅ Stop Typing
    socket.on("stopTyping", ({ chatId, senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("stopTyping", { chatId, senderId });
      }
    });

    // ✅ Send Message
    socket.on("sendMessage", async (data) => {
      const { chatId, senderId, text, receiverId } = data;
      try {
        await sendMessageSocket({ chatId, senderId, text, receiverId, app });
      } catch (err) {
        console.error("❌ Error sending message:", err);
      }
    });

    // ✅ Handle Disconnect (Last Seen Logic)
    socket.on("disconnect", async () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);

          const lastSeen = new Date();
          console.log(`🔴 User ${userId} went offline at ${lastSeen}`);

          // ✅ Save to DB
          await UserModel.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen,
          });

          // ✅ Notify clients
          io.emit("userOffline", { userId, lastSeen });
          break;
        }
      }
    });
  });

  app.set("io", io);
  app.set("onlineUsers", onlineUsers);
};

module.exports = setupSocket;
