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
  
      await characterProfile.findOneAndUpdate({ guildUser: user.id, name: name }, { $set: { "guildUser": user.id, "guildId": guild.id, "name": name, "avatar": avatar, "money": 15 } }, { upsert: true });
      
      const data = await characterProfile.findOne({ guildUser: user.id, name: name });
  
      interaction.reply({ content: `
Usuário: <@${data.guildUser}>
Servidor: ${data.guildId}
Nome: ${data.name}
Dracmas: ${data.money}
Avatar: ${data.avatar}
      ` });
  
      console.log(data.nomeDaPropriedade);
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
  