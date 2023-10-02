const mongoose = require("mongoose");

const characterProfile = mongoose.Schema({
  userID: { type: "String" }, //ID do Usuário dono do Personagem
  info: {
    name: { type: "String" },
    cabin: { type: "String" }, //Nome do Personagem
    avatar: { type: "String" }, //Avatar do Personagem
    banner: { type: "String" }, //Avatar do Personagem
    money: { type: Number, default: 5 }, //Dracmas do Personagem
    hitPoints: {
      base: { type: Number }, //HP Base
      current: { type: Number }, //HP Atual
    }, //HP
  },
  stats: {
    atrPoints: { type: Number }, //Pontos de Atributos, utilizados para melhorar os atributos. Podem ser ganhados em missões, eventos, treinamento, etc.
    atrCON: { type: Number, default: 8 }, //Atributo - Constituição
    atrFOR: { type: Number, default: 8 }, //Atributo - Força
    atrAGI: { type: Number, default: 8 }, //Atributo - Agilidade
    atrINT: { type: Number, default: 8 }, //Atributo - Inteligência
    artSAB: { type: Number, default: 8 },
    atrCAR: { type: Number, default: 8 }, //Atributo - Carisma
  }, //Atributos do Personagem
});

module.exports = mongoose.model("characterProfile", characterProfile);
