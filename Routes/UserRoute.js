const express = require("express");
const {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unFollowUser,
  getAllUser
} = require("../Controllers/UserController");
const route = express.Router();

route.get("/", getAllUser)
route.get("/:id", getUser);
route.put("/:id", updateUser);
route.delete("/:id", deleteUser);
route.put("/:id/follow", followUser);
route.put("/:id/unfollow", unFollowUser);

module.exports = route;
