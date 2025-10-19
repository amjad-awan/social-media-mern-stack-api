const { default: mongoose } = require("mongoose");
const PostModel = require("../Modals/postModel");
const CommentModel = require("../Modals/comment"); // ✅ import comments

// create new post

const Image = require("../Modals/image");
const UserModel = require("../Modals/userModel");

const createPost = async (req, res) => {
  try {
    const { userId, desc, likes } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // ❌ If both are missing, reject
    if (!desc && !req.file) {
      return res.status(400).json({ message: "Post must contain text or image" });
    }

    let imageId = null;

    // ✅ If image exists, save it
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const savedImage = await Image.create({
        data: base64Image,
        contentType: req.file.mimetype
      });
      imageId = savedImage._id;
    }

    // ✅ Create post (desc optional, imageId optional)
    const newPost = new PostModel({
      userId,
      desc: desc || "",
      likes: likes || [],
      imageId: imageId
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

   if (post.userId.toString() !== userId) {
  return res.status(403).json("Action forbidden");
}

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
    const currentUser = await UserModel.findById(userId);

    // 1️⃣ Get current user posts
    const currentUserPosts = await PostModel.find({ userId })
      .populate("userId", "firstname lastname profilePictureId");

    // 2️⃣ Get posts of following users
    const validFollowingIds = currentUser.following.filter(
      (id) => id && mongoose.Types.ObjectId.isValid(id)
    );

    const followingPosts = await PostModel.find({
      userId: { $in: validFollowingIds },
    }).populate("userId", "firstname lastname profilePictureId");

    // 3️⃣ Merge and sort
    let timeline = [...currentUserPosts, ...followingPosts].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    // 4️⃣ Attach comment count to each post
    timeline = await Promise.all(
      timeline.map(async (post) => {
        const count = await CommentModel.countDocuments({ postId: post._id });
        return { ...post._doc, commentCount: count };
      })
    );

    res.status(200).json(timeline);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch timeline posts",
      error: err.message,
    });
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
