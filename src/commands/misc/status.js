const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     *
     */

    callback: async (client, interaction) => {
        const embed = new EmbedBuilder()      
            .setTitle(`Status do Personagem ${interaction.options.get('personagem').value}`)
            .setDescription('SEU PERSONAGEM');

        interaction.reply({ embeds: [embed] });
    },

    name: 'status',
    description: 'Mostra o status atual do personagem escolhido.',
    options: [
        {
            name: 'personagem',
            description: 'O slot do personagem que você quer ver o status.',
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ]
};
