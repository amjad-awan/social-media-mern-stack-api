const express = require("express");
const route = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });

route.post(
  "/",
  upload.single("file", (req, res) => {
    try {
      return res.status(200).json("File Uploaded Successfully");
    } catch (err) {
      console.log("there is an error", err);
    }
  })
);

module.exports = route;
