const mongoose = require("mongoose");

const characterProfile = mongoose.Schema({
    userID: { type: "String" }, //ID do Usuário dono do Personagem
    info: {
        name: { type: "String" }, //Nome do Personagem
        avatar: { type: "String" }, //Avatar do Personagem
        money: { type: Number }, //Dracmas do Personagem
        hitPoints: {
            base: { type: Number }, //HP Base
            current: { type: Number }, //HP Atual
        }, //HP
    },
    stats: {
        atrPoints: { type: Number }, //Pontos de Atributos, utilizados para melhorar os atributos. Podem ser ganhados em missões, eventos, treinamento, etc.
        atrCON: { type: Number }, //Atributo - Constituição
        atrFOR: { type: Number }, //Atributo - Força
        atrAGI: { type: Number }, //Atributo - Agilidade
        atrINT: { type: Number }, //Atributo - Inteligência
        atrCAR: { type: Number }, //Atributo - Carisma
    }, //Atributos do Personagem
});

module.exports = mongoose.model("characterProfile", characterProfile);
