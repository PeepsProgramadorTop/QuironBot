const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');
const schema = require("../../models/schemaTeste");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */

  callback: async (client, interaction) => {
    const user = interaction.options.getUser("user") || interaction.user;

    await schema.findOneAndUpdate({ _id: user.id }, { $set: { "nomeDaPropriedade": user.id } }, { upsert: true });
    
    const data = await schema.findOne({ _id: user.id });

    interaction.reply({ content: `Seu ID (${data.nomeDaPropriedade}), foi salvo na database!` });

    console.log(data.nomeDaPropriedade);
  },

  name: 'alow',
  description: 'comando teste',
  options: [
    {
      name: 'user',
      description: 'usuário',
      type: ApplicationCommandOptionType.User,
      required: true,
    }
  ]
};
