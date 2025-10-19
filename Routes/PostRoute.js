const express= require("express")
const {createPost, getPost, updatePost, deletePost, likePost,getTimeLinePost}=require("../Controllers/PostController");
const multer = require("multer");
const route= express.Router()
const upload = multer(); // memory storage

//Create post route
route.post("/",upload.single("file"),createPost)
// Get post route
route.get("/:id",getPost)
// Update post route
route.put("/:id",updatePost)

// Delete post route
route.delete("/:id",deletePost)

// like/dislike post route
route.put("/:id/like",likePost)

// getting time post

route.get("/timelineposts/:id",getTimeLinePost)
module.exports=route