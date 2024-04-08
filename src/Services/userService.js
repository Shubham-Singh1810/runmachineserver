const mongoose = require("mongoose");
const User = require("../Model/userSchema");


exports.create = async (body) => {
  return await User.create(body);
};

exports.login = async (body) => {
  return await User.findOne(body).select("-Password");
};

exports.findUser = async (body) => {
  return await User.findOne(body);
};

exports.updateUser = async (filter, update) => {
  return await User.updateOne(filter, update, { new: true });
};


exports.updateOne = async (query, data) => {
  return await User.updateOne(query, data);
};


exports.getUser = async (query) => {
  return await User.findOne(query);
};



exports.getFollowing = async (currentUserId) => {
  try {
    const user = await User.findOne({_id:currentUserId}).select("Followings")
    .populate({path:"Followings", select: 'FullName'});
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving followings list");
  }
};



exports.getFollower = async (currentUserId) => {
  try {
    const user = await User.findOne({_id:currentUserId}).select("Followers")
    .populate({path:"Followers", select: 'FullName'});
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving followers list");
  }
};



exports.getBlockUsers = async (currentUserId) => {
  try {
    const user = await User.findOne({_id:currentUserId}).select("BlockUser")
    .populate({path:"BlockUser", select: 'FullName'});
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving BlockUser list");
  }
};

exports.getSuggestedUserAcounts = async (id) => {
  try {
    const user = await User.find().select("-Password")
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving suggested account list");
  }
};

