const UserModal = require("../Modals/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
      return res.status(400).json({ message: "Wrong Password" });
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




// FORGOT PASSWORD - generate reset token
const forgotPassword = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await UserModal.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate reset token (expires in 15 min)
    const resetToken = jwt.sign(
      { id: user._id },
      "RESET_PASSWORD_KEY",
      { expiresIn: "15m" }
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // Send email with token (example using nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amjadmalikf53@gmail.com",
        pass: "nvix gxnm fsdc hqmc",
      },
    });

    const mailOptions = {
      from: "amjadmalilf53@gmail.com",
      to: user.username,
      subject: "Password Reset",
      text: `Click here to reset your password: https://social-media-app-frontend-azure.vercel.app/reset-password/${resetToken}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else console.log("Email sent: " + info.response);
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, "RESET_PASSWORD_KEY");
    const user = await UserModal.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // remove reset token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {forgotPassword, resetPassword, registerUser, login };
