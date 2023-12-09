const mongoose = require("mongoose");

const characterProfile = mongoose.Schema({
  userID: { type: "String" }, //ID do Usuário - Utilizado para identificar a quem este personagem pertence.
  info: {
    prefix: { type: "String", required: true }, //Prefixo - Utilizado para enviar mensagens com o personagem.
    name: { type: "String", required: true }, //Nome - Utilizado para identificar o personagem.
    cabin: { type: "String", required: true }, //Chalé - O chalé do personagem
    nicknames: { type: "String", default: "Nenhum apelido." }, //Apelidos - Nomes exibidos debaixo do nome de exibição no banner.
    necklace_beads: { 
      amount: { type: Number, default: 0 }, //Quantidade de contas
      beads: [{ body: String }], //As contas
    }, //Colar de Contas do Personagem.
    avatar: { type: "String" }, //Avatar - Imagem de perfil do personagem, pode ser alterada. (Não é obrigatório.)
    banner: { type: "String" }, //Banner - imagem que normalmente representa o personagem, utilizada no status, pode ser alterada. (Não é obrigatório.)
    money: { type: Number, default: 1 }, //Dracmas - Moeda utilizada na economia do servidor.
    xp: { type: Number, default: 0 },
    mana: {
      base: { type: Number, default: 100 }, //Mana Base
      current: { type: Number, default: 0 }, //Mana Atual
    }, //Mana
    hitPoints: {
      base: { type: Number, default: 0 }, //HP Base
      current: { type: Number, default: 0 }, //HP Atual
    }, //HP
  },
  stats: {
    atrPoints: { type: Number, default: 36 }, //Pontos de Atributos, utilizados para melhorar os atributos. Podem ser ganhados em missões, eventos, treinamento, etc.
    atrCON: { type: Number, default: 0 }, //Atributo - Constituição
    atrFOR: { type: Number, default: 0 }, //Atributo - Força
    atrAGI: { type: Number, default: 0 }, //Atributo - Agilidade
    atrINT: { type: Number, default: 0 }, //Atributo - Inteligência
    atrSAB: { type: Number, default: 0 }, //Atributo - Sabedoria
    atrCAR: { type: Number, default: 0 }, //Atributo - Carisma
  }, //Atributos do Personagem
});

module.exports = mongoose.model("characterProfile", characterProfile);
