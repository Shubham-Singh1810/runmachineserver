const express = require("express");
const postController = express.Router();
const auth = require("../middleware/auth");
const {
  sendResponse,
  generateOTP,
  sendMail
} = require("../Utils/common");
// const imgUpload = require("../Utils/multer")
const upload = require("../Utils/multer")
const User = require("../Model/userSchema");
const Post = require("../Model/postSchema");
const TagData = require("../Model/tagSchema");
const LocationData = require("../Model/locationSchema");
const postService = require("../Services/postService");
const userService = require("../Services/userService")
const { body } = require("express-validator");
const cloudinary = require("../Utils/cloudinary");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });


postController.post("/create",
  upload.single("ImgUrl"),
  async (req, res) => {
    try {
      let obj;
      if (req.file) {
        let bannerImg = await cloudinary.uploader.upload(req.file.path, function (err, result) {
          if (err) {
            return err;
          } else {
            return result;
          }
        });
        obj = { ...req.body, ImgUrl: bannerImg.url };
      }
      const PostCreated = await Post.create(obj);
      let updateMyPost = { $push: { MyPost: PostCreated?._id } }
      await userService.updateUser({ _id: obj?.Author }, updateMyPost);
      sendResponse(res, 200, "Success", {
        message: "Post created successfully!",
        PostData: PostCreated,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
});

postController.get("/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return sendResponse(res, 422, "Failed", {
        message: "Params not found!",
      });
    }
    const posts = await postService.getPostbyId(req.params.id);
    sendResponse(res, 200, "Success", {
      message: "Post retrieved successfully!",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

postController.get("/user/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return sendResponse(res, 422, "Failed", {
        message: "Params not found!",
      });
    }
    const posts = await postService.getPostbyUser(req.params.id);
    sendResponse(res, 200, "Success", {
      message: "Posts retrieved successfully!",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

postController.post("/myfeed", async (req, res) => {
  try {
    const posts = await postService.myfeed(req.body.userId);
    sendResponse(res, 200, "Success", {
      message: "My feed retrieved successfully!",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.post("/likes/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return sendResponse(res, 422, "Failed", {
        message: "Params not found!",
      });
    }

    const postId = req.params.id;
    const currentUserId = req.body.currentUser; // Assuming you pass the current user's ID in the request body

    const post = await postService.findOne({ _id: postId });
    if (!post) {
      return sendResponse(res, 400, "Failed", {
        message: "Post not found!",
      });
    }

    let message, updateQuery;
    if (post.Likes.includes(currentUserId)) {
      updateQuery = { $pull: { Likes: currentUserId } }; // Remove the currentUserId from Likes array
      message = "unliked";
    } else {
      updateQuery = { $push: { Likes: currentUserId } }; // Add the currentUserId to Likes array
      message = "liked";
    }

    // Update the post document with the new Likes array
    await postService.findOneAndUpdate({ _id: postId }, updateQuery);

    // Fetch the updated post after the update
    const updatedPost = await postService.findOne({ _id: postId });

    sendResponse(res, 200, "Success", {
      message: `Post ${message} successfully!`,
      data: updatedPost,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.post("/save/:id", async (req, res) => {
  try {
    if (!req.params.id || !req.body.currentUser) {
      return sendResponse(res, 422, "Failed", {
        message: "Params or currentUser not found!",
      });
    }

    const postId = req.params.id;
    const currentUserId = req.body.currentUser;

    const post = await postService.findOne({ _id: postId });
    if (!post) {
      return sendResponse(res, 400, "Failed", {
        message: "Post not found!",
      });
    }

    const user = await userService.findUser({ _id: currentUserId });
    if (!user) {
      return sendResponse(res, 400, "Failed", {
        message: "User not found!",
      });
    }

    let message, updateQuery;
    if (user.SavedPost.includes(postId)) {
      updateQuery = { $pull: { SavedPost: postId } };
      message = "unsaved";
    } else {
      updateQuery = { $push: { SavedPost: postId } };
      message = "saved";
    }

    await userService.updateUser({ _id: currentUserId }, updateQuery);

    let updateForPostQuery;
    if (post.SavedBy.includes(currentUserId)) {
      updateForPostQuery = { $pull: { SavedBy: currentUserId }};
    } else {
      updateForPostQuery = { $push: { SavedBy: currentUserId }};
    }
    await postService.findOneAndUpdate({ _id: postId }, updateForPostQuery);

    sendResponse(res, 200, "Success", {
      message: `Post ${message} successfully!`,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.post("/getPostByFilter", async (req, res) => {
  try {
    const posts = await postService.getPosts(req.body);
    sendResponse(res, 200, "Success", {
      message: "Posts retrieved successfully!",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = postController;