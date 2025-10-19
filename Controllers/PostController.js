const { default: mongoose } = require("mongoose");
const PostModel = require("../Modals/postModel");
const UserModal = require("../Modals/userModel");

// create new post

const image = require("../Modals/image");

const createPost = async (req, res) => {
  try {
    const { userId, desc, likes } = req.body;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    // Convert uploaded file to Base64
    const base64Image = req.file.buffer.toString("base64");

    // Save image in DB
    const savedImage = await image.create({
      data: base64Image,
      contentType: req.file.mimetype
    });

    // Create post
    const newPost = new PostModel({
      userId,
      desc,
      likes: likes || [],
      imageId: savedImage._id
    });

    await newPost.save();
    res.status(200).json(newPost);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Post creation failed", error: err });
  }
};



// get a post
const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await PostModel.findById(id);
    console.log(post);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
};



// Update a post
const updatePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;

  try {
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    if (post.userId !== userId)
      return res.status(403).json("Action forbidden");

    const updateData = { ...req.body };

    // If a new image is uploaded
    if (req.file) {
      // Delete old image
      await Image.findByIdAndDelete(post.imageId);

      // Save new image
      const base64Image = req.file.buffer.toString("base64");
      const savedImage = await Image.create({
        data: base64Image,
        contentType: req.file.mimetype,
      });

      updateData.imageId = savedImage._id;
    }

    await post.updateOne({ $set: updateData });
    res.status(200).json("Post updated!");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    if (post.userId !== userId)
      return res.status(403).json("Action forbidden");

    // Delete the associated image
    await Image.findByIdAndDelete(post.imageId);

    // Delete the post
    await post.deleteOne();

    res.status(200).json("Post has been deleted");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};


// like/dislike post
const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post Liked");
    } else {
      // res.status(403).json("Action forbidden")
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post Unliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

//Get timeline post
const getTimeLinePost = async (req, res) => {
  const userId = req.params.id;
  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModal.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(
      [...currentUserPosts, ...followingPosts[0].followingPosts].sort(
        (a, b) => {
          return b.createdAt - a.createdAt;
        }
      )
    );
  } catch (err) {
    res.status(500).json(err);
  }
};
module.exports = {
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getTimeLinePost,
};
