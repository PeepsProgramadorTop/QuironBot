const mongoose = require("mongoose");

const webhookSchema = mongoose.Schema({
  webhookID: { type: "String" },
  webhookToken: { type: "String" },
  channel: { type: "String" }
});

module.exports = mongoose.model("webhookSchema", webhookSchema);
