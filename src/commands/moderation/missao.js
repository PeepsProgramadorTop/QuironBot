const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('missao')
        .setDescription('Cria uma missão.')
        .addStringOption((option) => option
            .setName('titulo')
            .setDescription('Nome da missão em questão.')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('desc')
            .setDescription('Breve resumo da missão.')
            .setRequired(true)
        )
        .addAttachmentOption((option) => option
            .setName('imagem')
            .setDescription('Imagem que ilustre a missão.')
            .setRequired(false)
        ),
    run: ({ client, interaction }) => {
        const user = interaction.user;
        const guild = interaction.guild;
        const title = interaction.options.get("titulo").value;
        const description = interaction.options.get("desc").value;
        const imagem = interaction.options.getAttachment("imagem");
        const channel = client.channels.cache.get("1156525267934781470");

        const embed = new EmbedBuilder();
        embed.setAuthor({
            name: `${user.username}`,
            iconURL: `${user.displayAvatarURL({ size: 1024 })}`,
        });
        embed.setTitle(`${title}`);
        embed.setDescription(`${description}`);
        if (imagem != null) {
            embed.setImage(imagem.url);
        }

        channel.send({ embeds: [embed] });
        interaction.reply("Missão enviada com sucesso!");
    }
};
