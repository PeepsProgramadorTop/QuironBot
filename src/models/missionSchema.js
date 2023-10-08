const mongoose = require("mongoose");

const missaoSchema = mongoose.Schema({
  id: { type: "String", require: true, unique: true, autoIncrement: true },
  name: { type: "String", require: true },
  description: { type: "String", require: true, unique: false },
  mestre: { type: "String", require: true, unique: false },
  players: { type: ["String"], require: false },
  image: { type: "String", require: false },
  cont: { type: "String", require: true },
  progress: { type: Boolean, require: true },
});

module.exports = mongoose.model("missaoSchema", missaoSchema);
