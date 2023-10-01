const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */

  callback: async (client, interaction) => {
    const slot = interaction.options.get("personagem").value - 1;
    const user = interaction.user;
    const data = await characterProfile.find({
      userID: user.id,
    });

    const author = client.users.cache.get(data[slot].userID);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${author.username}`,
        iconURL: `${author.displayAvatarURL({ size: 1024 })}`,
      })
      .setTitle(`Status de ${data[slot].info.name}`)
      .setDescription(
        `
## ⸻・\`📊\`・Geral:
👤・Jogador(a): \`@${author.username}\`
🫀・HP: \`20\`
🏛️・Chalé: \`1\`
## ⸻・\`🧮\`・Atributos:
- Constituição (CON): \`${data[slot].stats.statCON}\`
- Força (FOR): \`${data[slot].stats.statCON}\`
- Agilidade (AGI): \`${data[slot].stats.statCON}\`
- Inteligência (INT): \`${data[slot].stats.statCON}\`
- Percepção (PER): \`${data[slot].stats.statCON}\`
- Carisma (CAR): \`${data[slot].stats.statCON}\`
            `
      )
      .setThumbnail(data[slot].info.avatar);

    if (slot > data.length - 1) {
      interaction.reply({
        content: `Você não possui um personagem nesse slot.`,
      });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },

  name: "status",
  description: "Mostra o status atual do personagem escolhido.",
  options: [
    {
      name: "personagem",
      description: "O slot do personagem que você quer ver o status.",
      type: ApplicationCommandOptionType.Number,
    },
  ],
};
