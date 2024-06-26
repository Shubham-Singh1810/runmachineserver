const mongoose = require("mongoose");
const User = require("../Model/userSchema");
const Post = require("../Model/postSchema");
const Tag = require("../Model/tagSchema");
const Location = require("../Model/locationSchema");


exports.create = async (body) => {
  return await Post.create(body);
};

exports.findOne = async (query) => {
  return await Post.findOne(query);
};

exports.findOneAndUpdate = async (filter, data) => {
  return await Post.findOneAndUpdate(filter, data, { new: true });
};


exports.getPostbyUser = async (Author) => {
  return await Post.find({ Author: Author })
  .populate({ path: "Likes", select: "FullName" })
};

exports.getPostbyId = async (id) => {
  return await Post.findOne({ _id: id })
  .populate({ path: "Author", select: "FullName ProfilePic Followers" })
};

exports.myfeed = async (id) => {
  console.log(id)
  return await Post.find({})
    .populate({ path: "Author", select: "FullName ProfilePic Followers" })
    .sort({ createdAt: -1 }); 
};


exports.getTag = async () => {
  return await Tag.find({});
};


exports.updateTag = async (filter, update) => {
  return await Tag.updateOne(filter, update, { new: true });
};



exports.deleteOne = async (query) => {
  return await Tag.deleteOne(query);
};



exports.getLocation = async () => {
  return await Location.find({});
};


exports.updateLocation = async (filter, update) => {
  return await Location.updateOne(filter, update, { new: true });
};



exports.deleteOne = async (query) => {
  return await Location.deleteOne(query);
};



exports.getPosts = async (query) => {
  return await Post.find(query)
  .populate({ path: "Author", select: "FullName ProfilePic Followers" })
};


exports.deletePost = async (query) => {
  return await Post.deleteOne(query);
};
