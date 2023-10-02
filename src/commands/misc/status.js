const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */

  callback: async (client, interaction) => {
    const character = require("../../models/characterProfile");
    const user = interaction.user;
    const characterGroup = await character.find({ userID: user.id });
    let names = [];
    let choices = [];

    characterGroup.forEach((data) => {
      names.push(data.info.name);
    });

  },

  name: "status",
  description: "Pega os personagem aí doidão",
  option: [
    {
      name: "Personagem",
      description: "Escolha o personagem",
      choices: [],
    },
  ],
};
