const express = require("express");
const {registerUser, login} = require("./../Controllers/AuthController");
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", login);
module.exports = router;
