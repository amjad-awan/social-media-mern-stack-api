const express = require("express");
const { createChat,getUserChats } = require("../Controllers/ChatController");
const router = express.Router();

// Create chat between two users
router.post("/createChat", createChat);

// Get all chats of a user
router.get("/:userId", getUserChats);

module.exports = router;
