const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const userSchema = mongoose.Schema({
    FullName: {type: String},
    UserName: {type: String},
    Dob:{type:String},
    Email: {type: String},
    ProfilePic: {type:String},
    Bio: {type:String},
    Website:{type:String},
    Password: {type: String},
    Followers: [{ type: String, ref: "User" }],
    Followings: [{ type: String, ref: "User" }],
    BlockUser: [{ type: String, ref: "User" }],
    BlockBy: [{ type: String, ref: "User" }],
    MyPost:[{ type: String, ref: "Post" }],
    SavedPost:[{ type: String, ref: "Post" }],
    EmailVerified: {
      type: Boolean,
      default: false
    },
    UserOtp: {type: String}
});

userSchema.plugin(timestamps);
module.exports = mongoose.model("User", userSchema);

