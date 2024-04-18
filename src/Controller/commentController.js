const express = require("express");
const commentController = express.Router();

const { sendResponse } = require("../Utils/common");
const postService = require("../Services/postService");
const commentService = require("../Services/commentService");
const Comment = require("../Model/commentSchema");
const Post = require("../Model/postSchema");
const { default: mongoose } = require("mongoose");
// hg


commentController.post("/create/:_id", async (req, res) => {
  try {
    const postId = req.params._id; // Extract postId from route params
    if (!postId) {
      return sendResponse(res, 400, "Failed", {
        message: "Post ID is missing in route parameter!",
      });
    }

    const postData = await Post.findOne({ _id: postId });
    if (!postData) {
      return sendResponse(res, 400, "Failed", {
        message: "Post not found!",
      });
    }

    const commentData = await commentService.create({
      Author: req.body.Author,
      Comment:req.body.Comment,
      postId: postData._id, // Ensure postData is defined before accessing its _id property
    });

    await postService.findOneAndUpdate(
      { _id: postId },
      { $push: { Commnets: commentData._id } }
    );

    sendResponse(res, 200, "Success", {
      message: "Comment created successfully!",
      commentData,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


commentController.delete("/delete/:id", async (req, res) => {
  try {
    const commentId = req.params.id;
    // Find the comment by its ID
    const commentData = await commentService.findOne({ _id: commentId });
    
    // Check if the comment exists
    if (!commentData) {
      return sendResponse(res, 400, "Failed", {
        message: "Comment not found!",
      });
    }

    // Check if the logged-in user is the author of the comment
    // if (req.Author._id.toString() !== commentData.Author.toString()) {
    //   return sendResponse(res, 400, "Failed", {
    //     message: "Unable to delete others' comments!",
    //   });
    // }

    // Delete the comment
    const deletedComment = await commentService.deleteOne({ _id: commentId });

    // Check if the comment was successfully deleted
    if (!deletedComment || !deletedComment.acknowledged) {
      throw new Error("Unable to delete comment!");
    }

    // Remove the comment from the post's comments array
    await postService.findOneAndUpdate(
      { _id: commentData.postId },
      { $pull: { comments: commentId } }
    );

    // Send success response
    sendResponse(res, 200, "Success", {
      message: "Comment deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


commentController.get("/list/:id", async (req, res) => {
  try {
    if (req.params.id !== "undefined") {
      const postData = await Post.findOne({ _id: req.params.id });
      if (!postData) {
        return sendResponse(res, 400, "Failed", {
          message: "Post not found!",
        });
      }
      const commentData = await commentService.listAllComments(req.params.id);
      sendResponse(res, 200, "Success", {
        message: "Comments retrieved successfully!",
        commentData,
      });
    }
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});





commentController.post("/likes/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return sendResponse(res, 422, "Failed", {
        message: "Params not found!",
      });
    }

    const commentId = req.params.id;
    const currentUserId = req.body.currentUser; // Assuming you pass the current user's ID in the request body

    const comment = await commentService.findOne({ _id: commentId });
    if (!comment) {
      return sendResponse(res, 400, "Failed", {
        message: "Comment not found!",
      });
    }

    let message, updateQuery;
    if (comment.Likes.includes(currentUserId)) {
      updateQuery = { $pull: { Likes: currentUserId } }; // Remove the currentUserId from Likes array
      message = "unliked";
    } else {
      updateQuery = { $push: { Likes: currentUserId } }; // Add the currentUserId to Likes array
      message = "liked";
    }

    // Update the post document with the new Likes array
    await commentService.findOneAndUpdate({ _id: commentId }, updateQuery);

    // Fetch the updated post after the update
    const updatedComment = await commentService.findOne({ _id: commentId });

    sendResponse(res, 200, "Success", {
      message: `Comment ${message} successfully!`,
      data: updatedComment,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = commentController;
