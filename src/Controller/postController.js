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
  console.log("sjb")
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

postController.post("/createTag", async (req, res) => {
  try {
    const { userId, Tag, isApproved } = req.body;

    const tagData = { userId, Tag, isApproved };

    const TagCreated = await TagData.create(tagData);

    sendResponse(res, 200, "Success", {
      message: "Tag created successfully!",
      TagRecord: TagCreated,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.get("/getTag", async (req, res) => {
  try {
    const data = await postService.getTag();
    sendResponse(res, 200, "Success", {
      message: "Tag list retrieved successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.put("/updateTag", async (req, res) => {
  try {
    const data = await postService.updateTag({ _id: req.body._id }, req.body);
    sendResponse(res, 200, "Success", {
      message: "Tag updated successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.delete("/deleteTag", async (req, res) => {
  try {
    const data = await postService.deleteOne({ _id: req.body.TagId });
    sendResponse(res, 200, "Success", {
      message: "Tag deleted successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
}
);


postController.post("/createLocation", async (req, res) => {
  try {
    const { userId, Location, isApproved } = req.body;

    const locationData = { userId, Location, isApproved };

    const LocationCreated = await LocationData.create(locationData);

    sendResponse(res, 200, "Success", {
      message: "Location created successfully!",
      LocationRecord: LocationCreated,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.get("/getLocation", async (req, res) => {
  try {
    // const { userId } = req.query;
    const data = await postService.getLocation();
    sendResponse(res, 200, "Success", {
      message: "Location list retrieved successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.put("/updateLocation", async (req, res) => {
  try {
    const data = await postService.updateLocation({ _id: req.body._id }, req.body);
    sendResponse(res, 200, "Success", {
      message: "Location updated successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


postController.delete("/deleteLocation", async (req, res) => {
  try {
    const data = await postService.deleteOne({ _id: req.body.LocationId });
    sendResponse(res, 200, "Success", {
      message: "Location deleted successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
}
);

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