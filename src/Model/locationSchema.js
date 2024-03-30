const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const locationSchema = mongoose.Schema({
    Author: { type: String, ref: "User" },
    isApproved: {type: String, Boolean:false },
    Location: { type: String, ref: "Location" }
});

locationSchema.plugin(timestamps);
module.exports = mongoose.model("Location", locationSchema);

