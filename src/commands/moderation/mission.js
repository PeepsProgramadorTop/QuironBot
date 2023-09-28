const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Embed,
  EmbedBuilder,
} = require("discord.js");
const schema = require("../../models/schemaTeste");
const { channel } = require("aoi.js/src/handler/slashOption");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */

  callback: async (client, interaction) => {
    const title = interaction.options.get("titulo");
    const description = interaction.options.get("desc");
    const narrador = interaction.author.username;
    const channel = client.channels.cache.get("1156525267934781470");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${narrador}`,
        iconURL: `${author.displayAvatarURL({ size: 1024 })}`,
      })
      .setTitle(`${title}`)
      .setDescription(`${description}`);
    id.send({ embeds: [embed] });
  },

  name: "missao",
  description: "Envia uma missão no mural.",
  options: [
    {
      name: "titulo",
      description: "Nome da missão em questão",
      required: true,
    },
    {
      name: "desc",
      description: "Breve resumo da missão",
      required: true,
    },
  ],
};
