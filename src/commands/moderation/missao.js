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
    const user = interaction.user;
    const guild = interaction.guild;
    const title = interaction.options.get("titulo").value;
    const description = interaction.options.get("desc").value;
    const imagem = interaction.options.getAttachment("imagem");
    const channel = client.channels.cache.get("1156525267934781470");

    const embed = new EmbedBuilder();
    embed.setAuthor({
      name: `${user.username}`,
      iconURL: `${user.displayAvatarURL({ size: 1024 })}`,
    });
    embed.setTitle(`${title}`);
    embed.setDescription(`${description}`);
    if (imagem != null) {
      embed.setImage(imagem.url);
    }
    if (user.roles.cache.has("1156367995262730440")) {
      channel.send({ embeds: [embed] });
    } else {
      interaction.reply("Você não possui permissão para usar esse comando.");
    }
  },
  name: "missão",
  description: "Cria uma missão.",
  options: [
    {
      name: "titulo",
      description: "Nome da missão em questão.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "desc",
      description: "Breve resumo da missão.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "imagem",
      description: "Imagem que ilustre a missão.",
      type: ApplicationCommandOptionType.Attachment,
      required: false,
    },
  ],
};
