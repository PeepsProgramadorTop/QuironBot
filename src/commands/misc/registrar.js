const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');
const characterProfile = require("../../models/characterProfile");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */

  callback: async (client, interaction) => {
    const user = interaction.user;
    const guild = interaction.guild;
    const name = interaction.options.get('nome').value;
    const avatar = interaction.options.getAttachment('avatar').url;

    await characterProfile.findOneAndUpdate({
      'userID': user.id, 'info.name': name
    },
      {
        $set: {
          "userID": user.id, //ID do Usuário dono do Personagem
          "info": {
            "name": name, //Nome do Personagem
            "avatar": avatar, //Avatar do Personagem
            "money": 25, //Dracmas do Personagem
            "hitPoints": {
              "base": 25, //HP Base
              "current": 25 //HP Atual
            } //HP
          },
          "stats": {
            "atrPoints": 0, //Pontos de Atributos, utilizados para melhorar os atributos. Podem ser ganhados em missões, eventos, treinamento, etc.
            "atrCON": 0, //Atributo - Constituição
            "atrFOR": 0, //Atributo - Força
            "atrAGI": 0, //Atributo - Agilidade
            "atrINT": 0, //Atributo - Inteligência
            "atrCAR": 0 //Atributo - Carisma
          } //Atributos do Personagem
        }
      }, {
      upsert: true
    });

    const data = await characterProfile.findOne({
      'userID': user.id, 'info.name': name
    });

    interaction.reply({
      content: `
Usuário: <@${data.userID}>
Nome: ${data.info.name}
Dracmas: ${data.info.money}
Avatar: ${data.info.avatar}
HP: ${data.info.hitPoints.base}/${data.info.hitPoints.current}
` });
  },

  name: 'registrar',
  description: 'Registra um novo personagem para você.',
  options: [
    {
      name: 'nome',
      description: 'Nome do personagem que você quer criar.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'avatar',
      description: 'Avatar/imagem do personagem que você quer criar.',
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    }
  ]
};
