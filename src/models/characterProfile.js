const mongoose = require("mongoose");

const characterProfile = mongoose.Schema({
  guildUser: { type: "String", index: true },
  guildID: { type: "String", index: true },
  money: { type: Number },
  id: { type: "String", index: true },
  name: { type: "String" },
  baseHitPoints: { type: Number },
  bonusHitPoints: { type: Number },
  stats: { type: [Mixed] },
  inventory: { type: [Mixed] },
});

characterProfile.index({ guildID: 1 });
characterProfile.index({ guildUser: 1 });
characterProfile.index({ id: 1 });
module.exports = model("characterProfile", characterProfile);
