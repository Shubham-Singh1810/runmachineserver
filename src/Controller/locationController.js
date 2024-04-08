const express = require("express");
const locationController = express.Router();
const auth = require("../middleware/auth");
const {
  sendResponse,
  generateOTP,
  sendMail
} = require("../Utils/common");
// const imgUpload = require("../Utils/multer")
const LocationData = require("../Model/locationSchema");

const { body } = require("express-validator");

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });



locationController.post("/createLocation", async (req, res) => {
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
  
  
  locationController.get("/getLocation", async (req, res) => {
    try {
      // const { userId } = req.query;
      const data = await LocationData.find({});
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
  
  
  locationController.put("/updateLocation", async (req, res) => {
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
  
  
  locationController.delete("/deleteLocation", async (req, res) => {
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

module.exports = locationController;