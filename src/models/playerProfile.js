const mongoose = require("mongoose");

const playerProfile = new mongoose.Schema({
  nome: { type: String, require: true, unique: false },
  id: { type: String, require: true, unique: true },
  xp: { type: Number, default: 0 },
  dinheiro: { type: Number, default: 0 },
  inventario: { type: [[String]] },
  forca: { type: Number, require: true, default: 8 },
  destreza: { type: Number, require: true, default: 8 },
  constituicao: { type: Number, require: true, default: 8 },
  carisma: { type: Number, require: true, default: 8 },
  inteligencia: { type: Number, require: true, default: 8 },
  sabedoria: { type: Number, require: true, default: 8 },
});
