const mongoose = require("mongoose");

const missionSchema = mongoose.Schema({
  missionID: { type: "String", unique: true },
  masterID: { type: "String", required: true },
  title: { type: "String", required: true },
  description: { type: "String", required: true },
  players: { type: ["String"], required: false },
  image: { type: "String", required: false },
  bead: { type: "String", required: true },
  progress: { type: Boolean, required: true },
  embedID: { type: String, required: true },
});

module.exports = mongoose.model("missionSchema", missionSchema);
