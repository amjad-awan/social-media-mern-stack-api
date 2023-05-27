const UserModal = require("../Modals/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

//get all user
const getAllUser = async (req, res) => {
  try {
    let users = await UserModal.find()
users= users.map((user)=>{
const {password, ...otherDetails}=user._doc
return otherDetails
})
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json(err)
  }
}
// get a user
const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await UserModal.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json({ message: "No such user exists" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// update user

const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserAdminStatus, password } = req.body
  try {
    if (id === _id) {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      const user = await UserModal.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign({
        usename: user.username, id: user._id,

      }, "MERN", { expiresIn: "1h" })
      res.status(200).json({ user, token })
    } else {
      res
        .status(403)
        .json("Permission Denied!, you can just update your own profile");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

//delete user

const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;
  try {
    if (currentUserId === id || currentUserAdminStatus) {
      await UserModal.findByIdAndDelete(id);
      res.status(200).json("User Deleted successfully");
    } else {
      res.status(403).json("Permission Denied!. you only your own profile");
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
