const { Client, Interaction, EmbedBuilder } = require("discord.js");

const characterProfile = require("../../models/characterProfile.js");
const { description } = require("./registrar.js");

module.exports = {
  callback: async (client, interaction) => {
    const user = interaction.user;
    const guild = interaction.guild;

    const characterGroup = await characterProfile.find({
      UserID: user.id,
    });

    const names = [];
    characterGroup.forEach((data) => {
      names.push({ name: `${data.info.name}` });
    });

    const embed = new EmbedBuilder()
      .setTitle(`Personagens de: ${user.id}`)
      .addFields(
        names.map((characters, i) => ({
          inline: false,
          name: `${i + 1}`,
        }))
      );
    console.log(embed);

    interaction.reply({ embeds: [embed] });
  },

  name: "list",
  description: "Lista seus personagens",
};
