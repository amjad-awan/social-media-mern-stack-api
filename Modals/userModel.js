
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,
    require: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  profilePicture: String,
  coverPicture: String,
  livesin: String,
  worksAt: String,
  country:String,
  relationship: String,
  followers: [],
		following:[]

},		{
	timestamps:true
});

const UserModal= mongoose.model("Users", userSchema);
module.exports=UserModal
