const { WebhookClient, ChannelType } = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const webhookSchema = require("../../models/webhookSchema");

module.exports = async (reaction, user) => {
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  const userID = await characterProfile.findOne({
    "info.name": reaction.message.author.username.replace(
      /\s*\[\s*\d+\/\d+HP\s*\]\s*$/,
      "",
    ),
  });

  switch (reaction.emoji.name) {
    case "❌":
      try {
        if (userID.userID !== user.id) return;

        if (userID === null) return;

        reaction.message.delete();
      } catch {}
      break;
    case "📝":
      try {
        if (userID.userID !== user.id) return;

        if (userID === null) return;

        const channel =
          reaction.message.channel.type === ChannelType.PublicThread
            ? reaction.message.channel.parent
            : reaction.message.channel;

        const embed = [
          {
            color: 0x5865f2,
            author: {
              name: reaction.message.author.username.replace(
                /\s*\[\s*\d+\/\d+HP\s*\]\s*$/,
                "",
              ),
              icon_url: reaction.message.author.displayAvatarURL(),
            },
            description: reaction.message.content,
            image: {
              url: "https://i.imgur.com/vB47l60.png",
            },
            timestamp: new Date(reaction.message.createdTimestamp),
          },
        ];

        const reply = await reaction.client.users.send(user.id, {
          content:
            "> __**📝<:dot:1158109856725733378>Para editar a mensagem abaixo, basta mandar o novo conteúdo da mensagem neste chat.**__\n\n** **",
          embeds: embed,
        });

        const collector = reply.channel.createMessageCollector({
          max: 1,
          time: 5 * 60_000,
        });
        collector.on("collect", async (m) => {
          const data = await webhookSchema.findOne({ channel: channel.id });

          const webhookClient = new WebhookClient({
            id: data.webhookID,
            token: data.webhookToken,
          });

          await webhookClient.editMessage(reaction.message.id, {
            content: m.content,
            threadId:
              reaction.message.channel.type === ChannelType.PublicThread
                ? reaction.message.channel.id
                : null,
          });

          reaction.message.reactions.cache
            .get("📝")
            .remove()
            .catch((error) =>
              console.error("Failed to remove reactions:", error),
            );

          reply.channel.send(
            "Mensagem editada com sucesso! Dá uma olhada lá: " +
              reaction.message.url,
          );
        });

        collector.on("end", (collected) => {
          if (collected.size === 0) {
            reply.channel.send("Tempo acabou.");
          }
        });
      } catch {}
      break;
  }
};
