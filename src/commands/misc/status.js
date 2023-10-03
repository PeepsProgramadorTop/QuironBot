const {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");


module.exports = {

    callback: async (client, interaction) => {
        const user = interaction.user;
        const characterGroup = await characterProfile.find({ userID: user.id });

        const names = [];
        characterGroup.forEach((data) => {
            names.push({ name: `${data.info.name}`});
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
                        .setValue(characters.name.toLowerCase().replace(' ', '_'))
                )
            );

        const actionRow = new ActionRowBuilder().addComponents(charSelectMenu);
        
        interaction.reply({
            components: [actionRow]
        });
    },

    name: "status",
    description: "Pega os personagem aí doidão"
};
