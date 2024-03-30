const jwt = require("jsonwebtoken");
const { sendResponse } = require("../Utils/common");
const userService = require("../Services/userService")
require("dotenv").config();
// const auth = async (req, res, next) => {
//   let header = req.header("Authorization");
//   if (header) {
//     let token = req.header("Authorization").replace("Bearer ", "");
//     jwt.verify(token, process.env.JWT_KEY, (err, valid) => {
//       if (err) {
//         sendResponse(res, 403, "Error", {
//             message: "token not verified!",
//           });
//       } else {
//         next();
//       }
//     });
//   } else {
//     res.status(401).send({ error: "Token not provided" });
//   }
// };



const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer "))
    return sendResponse(res, 403, "Failed", {
      message: "Invalid authorization method!",
    });
  const token = authHeader.split(" ")[1];
  if (!token || token === null) {
    return sendResponse(res, 403, "Failed", {
      message: "Authorization token not found!",
    });
  }
  jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
    if (err)
      return sendResponse(res, 403, "Failed", {
        message: `Invalid Bearer token / ${err.message}`,
      });
    const { iat, exp, ...rest } = decoded;
    console.log( "hello", decoded);
    const user = await userService.findUser({ _id: rest._id });
    console.log(user)
    if (!user) {
      return sendResponse(res, 400, "Failed", {
        message: "User not found!",
      });
    }
    if (!(user.token === token)) {
      return sendResponse(res, 403, "Failed", {
        message: "Multiple session not allowed. Please logout!",
      });
    }
    req.user = user;
    next();
  });
};



module.exports = auth;