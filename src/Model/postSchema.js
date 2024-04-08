const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const postSchema = mongoose.Schema({
    ImgUrl: {type: String},
    Caption: {type: String},
    Likes: [{ type: String, ref: "User" }],
    SavedBy:[{ type: String, ref: "User" }],
    Commnets: [{ type: String, ref: "Comments" }],
    Author: { type: String, ref: "User" },
    ReportedBy: [{ type: String, ref: "User", reason: {type: String} }],
    LocationId: {type: String, ref: "Location" },
    TagId: { type: String, ref: "Tag" }
});

postSchema.plugin(timestamps);
module.exports = mongoose.model("Post", postSchema);

