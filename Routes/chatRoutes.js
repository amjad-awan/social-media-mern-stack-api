const express = require("express");
const { createChat,getUserChats, markAsRead } = require("../Controllers/ChatController");
const router = express.Router();

// Create chat between two users
router.post("/createChat", createChat);

// Get all chats of a user
router.get("/:userId", getUserChats);
router.post("/mark-read", markAsRead);


module.exports = router;
