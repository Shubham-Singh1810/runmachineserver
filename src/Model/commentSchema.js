const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const commentSchema = mongoose.Schema({
    Author: { type: String, ref: "User" },
    Likes : {type: String, ref: "User" },
    CommentedOn: { type: String, ref: "Post" },
    postId: { type: String, ref: "Post" },
    CommentReply: [{ commentedBy:{ type: String, ref: "User"}, reply:{type: String} }]
});

commentSchema.plugin(timestamps);
module.exports = mongoose.model("Comment", commentSchema);

