const mongoose = require("mongoose");
const globalVariables = require("../globalVariables.json");

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
    money: { type: Number, default: 50 }, //Dracmas - Moeda utilizada na economia do servidor.
    xp: { type: Number, default: 1 },
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
    atrPoints: { type: Number, default: 0 }, //Pontos de Atributos, utilizados para melhorar os atributos. Podem ser ganhados em missões, eventos, treinamento, etc.
    atrCON: {
      base: { type: Number, default: 8 },
      mod: { type: Number, default: 0 },
    }, //Atributo - Constituição
    atrFOR: {
      base: { type: Number, default: 8 },
      mod: { type: Number, default: 0 },
    }, //Atributo - Força
    atrAGI: {
      base: { type: Number, default: 8 },
      mod: { type: Number, default: 0 },
    }, //Atributo - Agilidade
    atrINT: {
      base: { type: Number, default: 8 },
      mod: { type: Number, default: 0 },
    }, //Atributo - Inteligência
    atrSAB: {
      base: { type: Number, default: 8 },
      mod: { type: Number, default: 0 },
    }, //Atributo - Sabedoria
    atrCAR: {
      base: { type: Number, default: 8 },
      mod: { type: Number, default: 0 },
    }, //Atributo - Carisma
  }, //Atributos do Personagem
  skills: {
    Atletismo: { type: Number, default: 0 },
    Acrobacia: { type: Number, default: 0 },
    Furtividade: { type: Number, default: 0 },
    Prestidigitação: { type: Number, default: 0 },
    Arcanismo: { type: Number, default: 0 },
    História: { type: Number, default: 0 },
    Investigação: { type: Number, default: 0 },
    Natureza: { type: Number, default: 0 },
    Intuição: { type: Number, default: 0 },
    Adestrar: { type: Number, default: 0 },
    Medicina: { type: Number, default: 0 },
    Percepção: { type: Number, default: 0 },
    Sobrevivência: { type: Number, default: 0 },
    Atuação: { type: Number, default: 0 },
    Enganação: { type: Number, default: 0 },
    Intimidação: { type: Number, default: 0 },
    Persuasão: { type: Number, default: 0 },
    Metalurgia: { type: Number, default: 0 },
    Hardware: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("characterProfile", characterProfile);
