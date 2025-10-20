const {   createNotification,
  getUserNotifications,
  markAsRead } = require("../Controllers/notificationController");

const router = require("express").Router();

router.post("/", createNotification);                         // create new notification
router.get("/:userId", getUserNotifications);                 // get all notifications of user
router.put("/read/:notificationId", markAsRead);              // mark as read

module.exports = router;
