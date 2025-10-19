const express = require("express");
const { addComment, getComments, deleteComment } = require("../Controllers/commentController");

const router = express.Router();

router.post("/", addComment);        // POST /comments/post
router.get("/:postId", getComments); // GET /comments/post/:postId
router.delete("/:id", deleteComment);// DELETE /comments/post/:id

module.exports = router;
