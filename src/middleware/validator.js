const { sendResponse } = require("../Utils/common");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
module.exports = {
  registerValidator: function (req, res, next) {
    if (!emailRegex.test(req.body.Email)) {
      sendResponse(res, 422, "Error", {
        message: "Email validation failed!",
      });
      return;
    }
    if (req.body.Password == "") {
        sendResponse(res, 422, "Error", {
          message: "Password is required!",
        });
        return;
      }
      if (req.body.FullName == "") {
        sendResponse(res, 422, "Error", {
          message: "FullName is required!",
        });
        return;
      }
    next();
  },


  loginValidator: function (req, res, next) {
      if (!emailRegex.test(req.body.Email)) {
        sendResponse(res, 422, "Error", {
          message: "Email validation failed!",
        });
        return;
      }
      if (req.body.Password == "") {
          sendResponse(res, 422, "Error", {
            message: "Password is required!",
          });
          return;
        }
      next();
  },
};
