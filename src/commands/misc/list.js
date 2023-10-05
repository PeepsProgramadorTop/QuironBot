const { Client, Interaction, EmbedBuilder } = require("discord.js");
const characterProfile = require("../../models/characterProfile.js");

module.exports = {
  callback: async (client, interaction) => {
    const user = interaction.user;
    const guild = interaction.guild;

    const characterGroup = await characterProfile.find({
      userID: user.id,
    });

    const names = [];
    characterGroup.forEach((data) => {
      names.push({ inline: false, name: `${data.info.name}` });
    });

    const fields = names.map(nameObj => {
      return { name: nameObj.name, inline: nameObj.inline, value: '** **' };
    });
    console.log(fields)
    
    const embed = new EmbedBuilder()
      .setTitle(`Personagens de: ${user.id}`)
      .setFields(fields);

    console.log(embed);

    interaction.reply({ embeds: [embed] });
  },

  name: "list",
  description: "Lista seus personagens",
};
