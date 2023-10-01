const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
} = require('discord.js');
const blogSchema = require("../../models/schemaTeste");

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

        await blogSchema.findOneAndUpdate({ userID: user.id }, { $set: { "inventory": { "statOne": 'oiii', "statTwo": 'dois', "statThree": 'tres' } } }, { upsert: true });

        const data = await blogSchema.findOne({ userID: user.id });

        interaction.reply({
            content: `${data.inventory.statOne}${data.inventory.statTwo}${data.inventory.statThree}`
        });
    },

    name: 'teste',
    description: 'testeee'
};
