const express = require("express");
const userController = express.Router();
const auth = require("../middleware/auth");
const {
  sendResponse,
  generateOTP,
  sendMail
} = require("../Utils/common");
const {
  registerValidator,
  loginValidator,
} = require("../middleware/validator");
// const upload = require("../Utils/multer")
const User = require("../Model/userSchema");
const userServices = require("../Services/userService");
const { body } = require("express-validator");
const jwt = require("jsonwebtoken")
const upload = require("../Utils/multer")
const cloudinary = require("../Utils/cloudinary");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

userController.post("/register", registerValidator, async (req, res) => {
  try {
    let isEmailExist = await User.findOne({ Email: req.body.Email });
    if (isEmailExist) {
      sendResponse(res, 202, "Success", {
        message: "This Email Already Exists!",
      });
      return;
    }

    const code = generateOTP();
    const userCreated = await userServices.create({...req.body, UserOtp:code});

    // Send OTP to the user's email
    const response = await sendMail(
      req.body.Email,
      "The OTP verification code is " + code + " for email verification."
    );
    sendResponse(res, 200, "Success", {
      message: "Registered successfully, please check your email!",
      data: userCreated,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.post("/resend_email_otp", async (req, res) => {
  try {
    const code = generateOTP();
    const updatedUser = await userServices.updateUser(
      { Email: req.body.Email },
        {
          $set: {
            UserOtp: code,
          },
        }
    );

    // Send OTP to the user's email
    const response = await sendMail(
      req.body.Email,
      "The OTP verification code is " + code + " for email verification."
    );
    sendResponse(res, 200, "Success", {
      message: "OTP has been send to your email",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.post("/login", loginValidator, async (req, res) => {
  let token;
  try {
    const loggedUser = await userServices.login(req.body);
    if (loggedUser) {
      if (!loggedUser.EmailVerified) {
        return sendResponse(res, 200, "Success", {
          message: "Please Verify your Email!",
        });
      }
      token = await jwt.sign({ loggedUser }, process.env.JWT_KEY);
      message = "logged in successfully";
    } else {
      return sendResponse(res, 200, "Success", {
        message : "Invalid Userdetails",
      });
     
    }
    sendResponse(res, 200, "Success", {
      message: message,
      userData: { loggedUser, token },
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.post("/verifyotp", async (req, res) => {
  try {
    let message = "";
    let user = await userServices.findUser(req.body);
    if (user) {
      message = "Otp verified successfully";
      user = await userServices.updateUser(
        { Email: user.Email },
        {
          $set: {
            EmailVerified: true,
          },
        }
      );
    } else {
      return sendResponse(res, 202, "Success", {
        message: "Wrong OTP",
      });
    }
    sendResponse(res, 200, "Success", {
      message: message,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.post("/changePassword", async (req, res) => {
  try {
    // Find the user based on userId
    let user = await userServices.findUser({ _id: req.body.userId });

    // Check if the user exists
    if (user) {
      // Check if the provided old password matches the stored password
      if (user.Password === req.body.Password) {
        // Update the user's password and set EmailVerified to true
        user = await userServices.updateUser(
          { _id: req.body.userId },
          {
            $set: {
              Password: req.body.newPassword,
              EmailVerified: true,
            },
          }
        );

        sendResponse(res, 200, "Success", {
          message: "Password updated successfully",
          user: user,
        });
      } else {
        sendResponse(res, 400, "Failed", {
          message: "Incorrect old password",
        });
      }
    } else {
      sendResponse(res, 404, "Failed", {
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.put("/updateUser",upload.single("ProfilePic"), async (req, res) => {
  try {
    let obj = req.body;
    if (req.file) {
      let ProfilePic = await cloudinary.uploader.upload(req.file.path, function (err, result) {
        if (err) {
          return err;
        } else {
          return result;
        }
      });
      obj = { ...req.body , ProfilePic:ProfilePic.url };
    }
    
    const data = await userServices.updateUser({ _id: req.body._id }, obj);
    sendResponse(res, 200, "Success", {
      message: "Users updated successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.get("/getUser/:id", async (req, res) => {
  try {
    const _id  = req.params.id;
    const data = await userServices.getUser({ _id });
    sendResponse(res, 200, "Success", {
      message: "User details retrieved successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.post("/follow", async (req, res) => {
  try {
    let currentUser = await userServices.findUser({ _id: req.body.currentUser });
    let requestUser = await userServices.findUser({ _id: req.body.requestUser });

    console.log(currentUser, requestUser)
    const currentQuery = {},
      requestQuery = {};

    if (currentUser.Followings.includes(requestUser._id)) {
      currentQuery["$pull"] = { Followings: requestUser._id };
      requestQuery["$pull"] = { Followers: currentUser._id };
      currentQuery["message"] = "unfollowed";
    } else {
      currentQuery["$push"] = { Followings: requestUser._id };
      requestQuery["$push"] = { Followers: currentUser._id };
      currentQuery["message"] = "followed";
    }

    await userServices.updateOne({ _id: currentUser._id }, currentQuery);
    await userServices.updateOne({ _id: requestUser._id }, requestQuery);

    sendResponse(res, 200, "Success", {
      message: `User ${currentQuery.message} successfully!`,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.post("/block", async (req, res) => {
  try {
    let currentUser = await userServices.findUser({ _id: req.body.currentUser });
    let requestUser = await userServices.findUser({ _id: req.body.requestUser });

    console.log(currentUser, requestUser)
    const currentQuery = {},
      requestQuery = {};

    if (currentUser.BlockUser.includes(requestUser._id)) {
      currentQuery["$pull"] = { BlockUser: requestUser._id };
      requestQuery["$pull"] = { BlockBy: currentUser._id };
      currentQuery["message"] = "unblocked";
    } else {
      currentQuery["$push"] = { BlockUser: requestUser._id };
      requestQuery["$push"] = { BlockBy: currentUser._id };
      currentQuery["message"] = "blocked";
    }

    await userServices.updateOne({ _id: currentUser._id }, currentQuery);
    await userServices.updateOne({ _id: requestUser._id }, requestQuery);

    sendResponse(res, 200, "Success", {
      message: `User ${currentQuery.message} successfully!`,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.get("/following/:id", async (req, res) => {
  const currentUser = req.params.id;
  try {
    const userData = await userServices.getFollowing(currentUser);
    sendResponse(res, 200, "Success", {
      message: "Following list retrieved successfully!",
      userData,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.get("/follower/:id",  async (req, res) => {
  const currentUser = req.params.id;
  try {
    const userData = await userServices.getFollower(currentUser);
    sendResponse(res, 200, "Success", {
      message: "Follower list retrieved successfully!",
      userData,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.get("/blockUsers/:id",  async (req, res) => {
  const currentUser = req.params.id;
  try {
    const userData = await userServices.getBlockUsers(currentUser);
    sendResponse(res, 200, "Success", {
      message: "Block Users list retrieved successfully!",
      userData,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


userController.get("/suggested/account/:id",  async (req, res) => {
  try {
    const userData = await userServices.getSuggestedUserAcounts(req.params.id);
    sendResponse(res, 200, "Success", {
      message: "Suggested Users list retrieved successfully!",
      userData,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.post("/searchUser", async (req, res) => {
  try {
    const searchKey  = req.body.searchKey;
    const data = await userServices.searchUsers({FullName: { $regex: searchKey, $options: "i" }});
    sendResponse(res, 200, "Success", {
      message: "Search User details retrieved successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


module.exports = userController;
