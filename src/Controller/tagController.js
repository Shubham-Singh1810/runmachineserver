const express = require("express");
const tagController = express.Router();
const auth = require("../middleware/auth");
const {
  sendResponse,
  generateOTP,
  sendMail
} = require("../Utils/common");
// const imgUpload = require("../Utils/multer")
const TagData = require("../Model/tagSchema");

const { body } = require("express-validator");

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });



tagController.post("/createTag", async (req, res) => {
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
tagController.get("/getTag", async (req, res) => {
  try {
    const data = await TagData.find({});
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


tagController.put("/updateTag", async (req, res) => {
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


tagController.delete("/deleteTag", async (req, res) => {
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

module.exports = tagController;