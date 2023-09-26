module.exports = {
  name: 'ping',
  description: 'Mostra o ping atual do bot!',

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! O ping atual é de ${client.ws.ping}ms!`
    );
  },
};
