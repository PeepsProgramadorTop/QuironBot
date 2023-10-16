const mongoose = require("mongoose");

const characterProfile = mongoose.Schema({
  userID: { type: "String" }, //ID do Usuário - Utilizado para identificar a quem este personagem pertence.
  info: {
    prefix: { type: "String", required: true }, //Prefixo - Utilizado para enviar mensagens com o personagem.
    name: { type: "String", required: true }, //Nome - Utilizado para identificar o personagem, uma vez setado não pode ser alterado.
    displayName: { type: "String", required: true }, //Nome de Exibição - Nome exibido em qualquer coisa sobre o personagem, pode ser alterado.
    cabin: { type: "String", required: true }, //Chalé - O chalé do personagem
    necklace_beads: { type: "String", default: "Nenhuma." }, //Colar de Contas do Personagem.
    avatar: { type: "String" }, //Avatar - Imagem de perfil do personagem, pode ser alterada. (Não é obrigatório.)
    banner: { type: "String" }, //Banner - imagem que normalmente representa o personagem, utilizada no status, pode ser alterada. (Não é obrigatório.)
    xp: { type: Number, default: 0 },
    money: { type: Number, default: 5 }, //Dracmas - Moeda utilizada na economia do servidor.
    hitPoints: {
      base: { type: Number, default: 0 }, //HP Base
      current: { type: Number, default: 0 }, //HP Atual
    }, //HP
  },
  stats: {
    atrPoints: { type: Number, default: 19 }, //Pontos de Atributos, utilizados para melhorar os atributos. Podem ser ganhados em missões, eventos, treinamento, etc.
    atrCON: { type: Number, default: 0 }, //Atributo - Constituição
    atrFOR: { type: Number, default: 0 }, //Atributo - Força
    atrAGI: { type: Number, default: 0 }, //Atributo - Agilidade
    atrINT: { type: Number, default: 0 }, //Atributo - Inteligência
    atrSAB: { type: Number, default: 0 }, //Atributo - Sabedoria
    atrCAR: { type: Number, default: 0 }, //Atributo - Carisma
  }, //Atributos do Personagem
});

module.exports = mongoose.model("characterProfile", characterProfile);
