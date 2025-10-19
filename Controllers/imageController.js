const Image = require("../Modals/image");

exports.uploadImage = async (req, res) => {
  try {
    const base64Image = req.file.buffer.toString("base64");

    const newImage = await Image.create({
      data: base64Image,
      contentType: req.file.mimetype
    });

    res.status(200).json({
      id: newImage._id,
      message: "Image uploaded successfully"
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    const imgBuffer = Buffer.from(image.data, "base64");
    res.set("Content-Type", image.contentType);
    res.send(imgBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching image" });
  }
};
