module.exports = {
  name: "alow",
  description: "Mostra o ping atual do bot!",

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(`ALOWWWWWWW!`);
  },
};
