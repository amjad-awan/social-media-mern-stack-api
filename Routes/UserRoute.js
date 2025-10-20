const express = require("express");
const {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unFollowUser,
  getAllUser,
  followersFollowings,
} = require("../Controllers/UserController");
const route = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

route.get("/", getAllUser);
route.get("/:id", getUser);
route.put(
  "/:id",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverPicture", maxCount: 1 },
  ]),
  updateUser
);
route.delete("/:id", deleteUser);
route.put("/:id/follow", followUser);
route.put("/:id/unfollow", unFollowUser);
route.get("/contacts/:userId", followersFollowings);


module.exports = route;
