const UserModal = require("../Modals/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const image = require("../Modals/image");
const mongoose = require("mongoose");

const Notification = require("../Modals/notification");
const { sendNotification } = require("../services/notificationService");
const UserModel = require("../Modals/userModel");
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
  const { _id, password, followers, following } = req.body;

  try {
    // 1️⃣ Permission check
    if (id !== _id) {
      return res
        .status(403)
        .json("Permission Denied! You can only update your own profile");
    }

    // 2️⃣ Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(password, salt);
    }

    // 3️⃣ Handle profile & cover images
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

    // 4️⃣ Parse and filter followers/following
    if (followers) {
      let followersArray = followers;
      if (typeof followers === "string") {
        followersArray = followers.split(","); // comma-separated string → array
      }
      req.body.followers = Array.isArray(followersArray)
        ? followersArray.filter((id) => id && mongoose.Types.ObjectId.isValid(id))
        : [];
    }

    if (following) {
      let followingArray = following;
      if (typeof following === "string") {
        followingArray = following.split(",");
      }
      req.body.following = Array.isArray(followingArray)
        ? followingArray.filter((id) => id && mongoose.Types.ObjectId.isValid(id))
        : [];
    }

    // 5️⃣ Update user in DB
    const user = await UserModal.findByIdAndUpdate(id, req.body, { new: true });

    // 6️⃣ Generate new token
    const token = jwt.sign(
      { username: user.username, id: user._id },
      "MERN",
      { expiresIn: "1h" }
    );

    // 7️⃣ Exclude password from response
    const { password: pwd, ...otherDetails } = user._doc;

    res.status(200).json({ user: otherDetails, token });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ message: "Failed to update user", error: err.message });
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
  const id = req.params.id;  // user to follow
  const { _id } = req.body;  // logged-in user

  if (_id === id) {
    return res.status(403).json({ success: false, message: "Action forbidden" });
  }

  try {
    const followUserDoc = await UserModal.findById(id);
    const followingUserDoc = await UserModal.findById(_id);

    if (!followUserDoc.followers.includes(_id)) {
      await followUserDoc.updateOne({ $push: { followers: _id } });
      await followingUserDoc.updateOne({ $push: { following: id } });

      // Create follow notification via service
      await sendNotification({
        userId: id,         // recipient
        senderId: _id,      // who followed
        type: "follow",
        message: "started following you",
        app: req.app,
      });

      return res.status(200).json({ success: true, message: "User followed!" });
    } else {
      return res.status(403).json({ success: false, message: "User is already followed by you" });
    }
  } catch (err) {
    console.error("Follow Error:", err);
    return res.status(500).json({ success: false, message: "Failed to follow user", error: err.message });
  }
};

// Unfollow a user
const unFollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  if (_id === id) {
    return res.status(403).json({ success: false, message: "Action forbidden" });
  }

  try {
    const followUserDoc = await UserModal.findById(id);
    const followingUserDoc = await UserModal.findById(_id);

    if (followUserDoc.followers.includes(_id)) {
      await followUserDoc.updateOne({ $pull: { followers: _id } });
      await followingUserDoc.updateOne({ $pull: { following: id } });

      // ✅ No notification for unfollow
      return res.status(200).json({ success: true, message: "User unfollowed!" });
    } else {
      return res.status(403).json({ success: false, message: "User is not followed by you" });
    }
  } catch (err) {
    console.error("Unfollow Error:", err);
    return res.status(500).json({ success: false, message: "Failed to unfollow user", error: err.message });
  }
};






// GET followers and following for a user
const followersFollowings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await UserModel.findById(userId)
      .select("followers following")
      .populate("followers", "_id username profilePictureId firstname lastname")
      .populate("following", "_id username profilePictureId firstname lastname");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Merge followers and following, remove duplicates
    const contactsMap = {};
    user.followers.forEach((u) => (contactsMap[u._id] = u));
    user.following.forEach((u) => (contactsMap[u._id] = u));
    const contacts = Object.values(contactsMap);

    res.status(200).json({ contacts });
  } catch (err) {
    console.error("Fetch contacts error:", err);
    res.status(500).json({ message: "Failed to fetch contacts", error: err.message });
  }
};



module.exports = {followersFollowings, getUser, updateUser, deleteUser, followUser, unFollowUser, getAllUser };
