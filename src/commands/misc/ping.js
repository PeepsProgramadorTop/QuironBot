const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mostra o ping atual do bot!'),
    run: async ({ client, interaction }) => {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(
            `Pong! O ping atual é de ${client.ws.ping}ms!`
        );
    }
};