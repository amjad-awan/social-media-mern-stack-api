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

const connectDB= async()=>{
  try{
  const conn= await mongoose.connect("mongodb+srv://amjadmalikf53:rAbtP2FDS3PuVGj7@cluster0.kkpnz4e.mongodb.net/social-media-mernstack-app?retryWrites=true&w=majority");
  
  console.log(`data base is connected to host ${conn.connection.host}`)
  }catch(error){
  console.log(`Error in db ${error}`)
  }
  }

  connectDB();
app.get("/",(req,res)=>{
res.status(200).send({message:"this api is running"})
})
app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/post", PostRoute);
app.use("/upload", UploadRoute);
app.listen(PORT, () => {
  console.log(`app is running at port ${PORT}`);
});
