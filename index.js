const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");

// Routes
const AuthRoute = require("./Routes/AuthRoute");
const UserRoute = require("./Routes/UserRoute");
const PostRoute = require("./Routes/PostRoute");
const UploadRoute = require("./Routes/UploadRoute");
const commentRoute = require("./Routes/commentRoute");
const notificationRoute = require("./Routes/notificationRoutes");
const chatRoute = require("./Routes/chatRoutes");
const messageRoute = require("./Routes/messageRoutes");


const connectDB = require("./DB/db");
const setupSocket = require("./Socket/socket");

// Modules

const PORT = process.env.PORT || 8080;

// ---------------- Middleware ----------------
app.use(express.static("public"));
app.use("/images", express.static("images"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors()
);

// ---------------- MongoDB Connection ----------------
connectDB();

// ---------------- Routes ----------------
app.get("/", (req, res) => {
  res.status(200).send({ message: "API is running" });
});
app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/post", PostRoute);
app.use("/", UploadRoute);
app.use("/comments/post", commentRoute);
app.use("/notifications", notificationRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);


// ---------------- HTTP Server ----------------
const server = http.createServer(app);

// ---------------- Socket.IO ----------------
setupSocket(server, app);

// ---------------- Start Server ----------------
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
