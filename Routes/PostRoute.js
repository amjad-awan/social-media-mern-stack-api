const express= require("express")
const {createPost, getPost, updatePost, deletePost, likePost,getTimeLinePost}=require("../Controllers/PostController")
const route= express.Router()

//Create post route
route.post("/",createPost)
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