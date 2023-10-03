const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");

module.exports = {
  callback: async (client, interaction) => {
    const user = interaction.user;
    const characterGroup = await characterProfile.find({ userID: user.id });

    const names = [];
    characterGroup.forEach((data) => {
      names.push({ name: `${data.info.name}` });
    });

    const charSelectMenu = new StringSelectMenuBuilder()
      .setCustomId(interaction.id)
      .setPlaceholder("Selecione o personagem que você quer ver o status.")
      .setMinValues(0)
      .setMaxValues(1)
      .addOptions(
        names.map((characters) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(characters.name)
            .setDescription("Personagem.")
            .setValue(characters.name)
        )
      );

    const actionRow = new ActionRowBuilder().addComponents(charSelectMenu);

    const reply = await interaction.reply({
      components: [actionRow],
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) =>
        i.user.id === interaction.user.id && i.customId === interaction.id,
      time: 60_000,
    });

    collector.on("collect", async (interaction) => {
      const character = interaction.values[0];

      const query = await characterProfile.findOne({
        userID: user.id,
        "info.name": character,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${query.info.name}`)
        .setDescription(
          `FORÇA💪: ${query.stats.atrFOR}
        DESTREZA: ${query.stats.atrAGI}
        CONSTITUIÇÃO: ${query.stats.atrCON}
        INTELIGENCIA: ${query.stats.atrINT}
        SABEDORIA: ${query.stats.atrSAB}
        CARISMA: ${query.stats.atrCAR}`
        )
        .setThumbnail(query.info.avatar);

      interaction.reply({ embeds: [embed] });
    });
  },

  name: "status",
  description: "Pega os personagem aí doidão",
};
