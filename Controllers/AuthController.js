const UserModal = require("../Modals/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// register user
const registerUser = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);
  req.body.password = hashedPass;
  const newUser = new UserModal(req.body);
  const { username } = req.body;
  try {
    const oldUser = await UserModal.findOne({ username });
    if (oldUser) {
      return res.status(400).json({ message: "user already registered!" });
    }
    // after saving, use will return as reponse
    const user = await newUser.save();

    const token = jwt.sign(
      {
        username: user.username,
        id: user._id,
      },
      "MERN",
      { expiresIn: "1h" }
    );
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// login user
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModal.findOne({ username: username });
    if (user) {
      const validity = await bcrypt.compare(password, user.password);
      // validity
      //   ? res.status(200).json({ message: "User Login Successfully", user })
      //   : res.status(400).json({ message: "Wrong Password" });
      if (!validity) {
        res.status(200).json("Wrong Password");
      } else {
        const token = jwt.sign(
          {
            username: user.username,
            id: user._id,
          },
          "MERN",
          { expiresIn: "1h" }
        );
        res.status(200).json({ user, token });
      }
    } else {
      res.status(404).json({ message: "User does not exists" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { registerUser, login };
