const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    EmbedBuilder,
} = require('discord.js');
const characterProfile = require("../../models/characterProfile");

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     *
     */

    callback: async (client, interaction) => {
        const slot = interaction.options.get('personagem').value - 1
        const user = interaction.user;
        const data = await characterProfile.find({
            'userID': user.id
        });

        const author = client.users.cache.get(data[slot].userID);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${author.username}`, iconURL: `${author.displayAvatarURL({ size: 1024 })}` })
            .setTitle(`Status de ${data[slot].info.name}`)
            .setDescription(`
## ⸻・\`📊\`・Geral:
👤・Jogador(a): \`@${author.username}\`
🫀・HP: \`20\`
🏛️・Chalé: \`1\`
## ⸻・\`🧮\`・Atributos:
- Constituição (CON): \`0\`
- Força (FOR): \`0\`
- Agilidade (AGI): \`0\`
- Inteligência (INT): \`0\`
- Percepção (PER): \`0\`
- Carisma (CAR): \`0\`
            `)
            .setThumbnail(data[slot].info.avatar);

        if (slot > data.length - 1) {
            interaction.reply({ content: `Você não possui um personagem nesse slot.` });
        } else {
            interaction.reply({ embeds: [ embed ] });
        }
    },

    name: 'status',
    description: 'Mostra o status atual do personagem escolhido.',
    options: [
        {
            name: 'personagem',
            description: 'O slot do personagem que você quer ver o status.',
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ]
};
