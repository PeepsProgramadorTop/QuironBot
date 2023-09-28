const mongoose = require("mongoose");

const characterProfile = mongoose.Schema({
  guildUser: { type: "String" }, //Id do Usuário dono do Perso
  guildID: { type: "String" }, //Id do Servidor
  money: { type: Number }, //Dracmas do perso
  name: { type: "String" }, //Nome do Perso
  avatar: { type: "String" }, //Avatar do Perso
  baseHitPoints: { type: Number }, //HP Base
  bonusHitPoints: { type: Number }, //HP bonus
  stats: { type: [mongoose.Schema.Types.Mixed] }, //Atributos
  inventory: { type: [mongoose.Schema.Types.Mixed] }, //Inventário do Perso
});

module.exports = mongoose.model("characterProfile", characterProfile);
