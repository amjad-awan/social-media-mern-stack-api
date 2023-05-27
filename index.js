const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const AuthRoute = require("./Routes/AuthRoute");
const UserRoute = require("./Routes/UserRoute");
const PostRoute = require("./Routes/PostRoute");
const UploadRoute = require("./Routes/UploadRoute");
const path = require("path");
const cors = require("cors");
require('dotenv').config()

const PORT = 8080

//to save images for public
app.use(express.static("public"))
app.use("/images", express.static("images"));
///middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const databaseConnection = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/SocialMediaApp", {
      // useNewUlrParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("database is connected")
  } catch (err) {
    console.log("database is not connected", err)
  }
}


databaseConnection()
app.get("/",(req,res)=>{
  res.setHeader("Access-Control-Allow-Credentials")
})
app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/post", PostRoute);
app.use("/upload", UploadRoute);
app.listen(PORT, () => {
  console.log(`app is running at port ${PORT}`);
});
