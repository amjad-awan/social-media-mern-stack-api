const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // two users in chat
    lastMessage: { type: String, default: "Start conversation ..." },
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("Chat", chatSchema);
module.exports = ChatModel;
