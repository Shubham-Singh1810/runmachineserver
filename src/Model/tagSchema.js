const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const tagSchema = mongoose.Schema({
    Author: { type: String, ref: "User" },
    isApproved: {type: String, Boolean:false },
    Tag: { type: String, ref: "Tag" }
});

tagSchema.plugin(timestamps);
module.exports = mongoose.model("Tag", tagSchema);

