const UserModal = require("../Modals/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const image = require("../Modals/image");

// GET all users
const getAllUser = async (req, res) => {
  try {
    let users = await UserModal.find();

    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails; // returns profilePictureId & coverPictureId as IDs
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET a single user
const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await UserModal.findById(id);
    if (!user) return res.status(404).json({ message: "No such user exists" });

    const { password, ...otherDetails } = user._doc;
    res.status(200).json(otherDetails);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE user (with optional profilePicture & coverPicture)
const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, password } = req.body;

  try {
    if (id !== _id) {
      return res
        .status(403)
        .json("Permission Denied! You can only update your own profile");
    }

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(password, salt);
    }

   if (req.files?.profilePicture?.length) {
  const profileImg = req.files.profilePicture[0];
  const base64Image = profileImg.buffer.toString("base64");
  const savedImage = await image.create({
    data: base64Image,
    contentType: profileImg.mimetype,
  });
  req.body.profilePictureId = savedImage._id;
}

if (req.files?.coverPicture?.length) {
  const coverImg = req.files.coverPicture[0];
  const base64Image = coverImg.buffer.toString("base64");
  const savedImage = await image.create({
    data: base64Image,
    contentType: coverImg.mimetype,
  });
  req.body.coverPictureId = savedImage._id;
}

    // Update user
    const user = await UserModal.findByIdAndUpdate(id, req.body, { new: true });

    const token = jwt.sign(
      { username: user.username, id: user._id },
      "MERN",
      { expiresIn: "1h" }
    );

    const { password: pwd, ...otherDetails } = user._doc;

    res.status(200).json({ user: otherDetails, token });
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;
  try {
    if (currentUserId === id || currentUserAdminStatus) {
      await UserModal.findByIdAndDelete(id);
      res.status(200).json("User deleted successfully");
    } else {
      res.status(403).json("Permission Denied! You can only delete your own profile");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// follow a user
const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  if (_id === id) {
    res.status(403).json("Action forbidden");
  }
  try {
    const followUser = await UserModal.findById(id);
    const followingUser = await UserModal.findById(_id);
    if (!followUser.followers.includes(_id)) {
      await followUser.updateOne({ $push: { followers: _id } });
      await followingUser.updateOne({ $push: { following: id } });
      await res.status(200).json("User followed!");
    } else {
      res.status(403).json("User is already followed by you ");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// unFollowUser a user
const unFollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  if (_id === id) {
    res.status(403).json("Action forbidden")
  }
  try {
    const followUser = await UserModal.findById(id);
    const followingUser = await UserModal.findById(_id);
    if (followUser.followers.includes(_id)) {
      await followUser.updateOne({ $pull: { followers: _id } });
      await followingUser.updateOne({ $pull: { following: id } });
      await res.status(200).json("User Unfollowed!");
    } else {
      res.status(403).json("User is not followed by you ");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
module.exports = { getUser, updateUser, deleteUser, followUser, unFollowUser, getAllUser };
