const { default: mongoose } = require("mongoose");
const PostModel = require("../Modals/postModel");
const UserModal = require("../Modals/userModel");

// create new post
const createPost = async (req, res) => {
  const { userId, desc, likes, image } = req.body;
  newPost = new PostModel({
    userId,
    desc,
    likes,
    image,
  });
  try {
    await newPost.save();
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json(err)
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

//Update a post
const updatePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;
  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      //to update single post getting from postId
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post updated!");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (post) {
      if (post.userId === userId) {
        //to delete single post getting from id
        await post.deleteOne();
        res.status(200).json("Post has been deleted");
      } else {
        res.status(403).json("Action forbidden");
      }
    } else {
      res.status(403).json("No such post exists");
    }
  } catch (err) {
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
