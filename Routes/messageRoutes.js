const express = require("express");
const { sendMessage,getChatMessages } = require("../Controllers/messageController");
const router = express.Router();

router.post("/send", sendMessage);
router.get("/:chatId", getChatMessages);

module.exports = router;
