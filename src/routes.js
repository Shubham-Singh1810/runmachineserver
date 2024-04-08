const express = require("express");
const router = express.Router();
const imgUpload = require("./Utils/multer")
const userController = require("./Controller/userController");
const postController = require("./Controller/postController");
const commentController = require("./Controller/commentController");
const tagController = require("./Controller/tagController")
const locationController = require("./Controller/locationController")

router.use("/user", userController);
router.use("/post", postController);
router.use("/tag", tagController);
router.use("/comment", commentController);
router.use("/location", locationController);



module.exports = router;