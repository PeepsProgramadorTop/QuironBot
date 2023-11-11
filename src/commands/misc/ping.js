const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Mostra o ping atual do bot!")
        .addAttachmentOption((option) => option
            .setName("avatar")
            .setDescription("Avatar/imagem do personagem que você quer criar.")
            .setRequired(false),
        ),
    run: async ({ client, interaction }) => {
        const teste = await axios.get(interaction.options.getAttachment("avatar").url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(teste.data);
        const attachment = new AttachmentBuilder(buffer, { name: 'teste.png' })

        const image = await interaction.channel.send({ files: [ attachment ] });
        return console.log(image.attachment.first().proxyURL)

        interaction.reply({ content: "oi", files: [ attachment ] })
    },
};
