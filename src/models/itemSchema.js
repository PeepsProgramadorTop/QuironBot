const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, require: true, unique: true, auto: true },
  nome: { type: String, require: true, unique: true },
  description: { type: String, require: true, unique: false },
  preco: { type: Number, require: true, unique: false },
});
