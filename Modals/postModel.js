const mongoose = require("mongoose");


const postSchema= new mongoose.Schema({
	userId:{
		type:String,
		required:true,
	},
	desc:String,
	likes:[],
	image:String
},{
	timestamps:true
})

const PostModel= mongoose.model("post",postSchema)

module.exports=PostModel