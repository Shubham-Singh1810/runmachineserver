const Comment = require("../Model/commentSchema");
const Post = require("../Model/postSchema");

exports.create = async (query) => {
  return await Comment.create(query);
};


exports.listAllComments = async (id) => {
  return await Comment.find({postId: id}).populate({
      path: "Author", select: 'FullName'
  })
}


exports.findOne = async (query) => {
  return await Comment.findOne(query)
}


exports.deleteOne = async (query) => {
  return await Comment.deleteOne(query);
};


exports.findOneAndUpdate = async (filter, data) => {
  return await Comment.findOneAndUpdate(filter, data);
};