const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editar')
        .setDescription('Edita informações do seu personagem.'),
    run: ({interaction}) => {
        interaction.reply("FOI")
    }
};
