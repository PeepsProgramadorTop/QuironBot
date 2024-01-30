const mongoose = require("mongoose");

const playerProfile = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
  userID: { type: "String", index: true },
  guildID: { type: "String", index: true },
  defaultCharacter: { type: String },
});

playerProfile.index({ guildID: 1 });
playerProfile.index({ userID: 1 });
module.exports = mongoose.model("playerProfile", playerProfile);
