const mongoose = require("mongoose");

const characterProfile = mongoose.Schema({
  guildUser: { type: "String" }, //Id do Usuário dono do Perso
  guildID: { type: "String" }, //Id do Servidor
  money: { type: Number }, //Dracmas do perso
  name: { type: "String" }, //Nome do Perso
  avatar: { type: "String" }, //Avatar do Perso
  baseHitPoints: { type: Number }, //HP Base
  currentHitPoints: { type: Number }, //HP Atual //Atributos
  inventory: { type: [String] }, //Inventário do Perso
  forca: { type: Number, default: 8 },
  destreza: { type: Number, default: 8 },
  constituicao: { type: Number, default: 8 },
  inteligencia: { type: Number, default: 8 },
  sabedoria: { type: Number, default: 8 },
  carisma: { type: Number, default: 8 },
});

module.exports = mongoose.model("characterProfile", characterProfile);
