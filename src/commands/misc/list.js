const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const characterProfile = require("../../models/characterProfile.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lista os seus personagens.'),
    run: async ({ interaction }) => {
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
    }
};