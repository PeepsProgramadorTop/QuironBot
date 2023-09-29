const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: { type: String, require: true, unique: true },
  nome: { type: String, require: true, unique: true },
  description: { type: String, require: true, unique: false },
  preco: { type: Number, require: true, unique: false },
});

module.exports = mongoose.model("itemSchema", itemSchema);