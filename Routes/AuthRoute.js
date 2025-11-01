const express = require("express");
const {registerUser, login,resetPassword, forgotPassword} = require("./../Controllers/AuthController");
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
module.exports = router;
