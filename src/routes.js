const express = require("express");
const router = express.Router();
const imgUpload = require("./Utils/multer")
const userController = require("./Controller/userController");
const postController = require("./Controller/postController");
const commentController = require("./Controller/commentController");

router.use("/user", userController);
router.use("/post", postController);
router.use("/comment", commentController);



module.exports = router;