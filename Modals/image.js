const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Image", ImageSchema);
