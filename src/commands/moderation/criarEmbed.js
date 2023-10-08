const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('criar-embed')
        .setDescription('Cria uma embed.').addChannelOption((option) => option
            .setName('canal')
            .setDescription('Canal aonde você quer enviar a mensagem com a embed.')
        )
        .addStringOption((option) => option
            .setName('autor')
            .setDescription('Texto localizado acima de todo o resto da embed.')
        )
        .addAttachmentOption((option) => option
            .setName('icon-autor')
            .setDescription('Texto pequeno que fica acima de todo o resto da embed, ao lado do texto do autor.')
        )
        .addStringOption((option) => option
            .setName('titulo')
            .setDescription('Título da embed.')
        )
        .addStringOption((option) => option
            .setName('desc')
            .setDescription('Descrição da embed.')
        )
        .addAttachmentOption((option) => option
            .setName('imagem')
            .setDescription('Imagem anexada à embed, localizada abaixo do texto.')
        )
        .addAttachmentOption((option) => option
            .setName('thumbnail')
            .setDescription('Imagem pequena localizada ao lado do texto.')
        )
        .addStringOption((option) => option
            .setName('cor')
            .setDescription('Cor da embed em código HEX (#000000).')
        )
        .addStringOption((option) => option
            .setName('footer')
            .setDescription('Texto pequeno que fica abaixo de todo o resto da embed.')
        )
        .addAttachmentOption((option) => option
            .setName('icon-footer')
            .setDescription('Imagem pequena que fica abaixo de todo o resto da embed, ao lado do texto footer.')
        ),
    run: ({ interaction }) => {
        const user = interaction.user;
        const guild = interaction.guild;

        const channel = interaction.options.getChannel('canal') == null ? interaction.channel : interaction.options.getChannel('canal');
        const author = interaction.options.get('autor');
        const authorIcon = interaction.options.getAttachment('icon-autor');
        const title = interaction.options.get('titulo');
        const description = interaction.options.get('desc');
        const image = interaction.options.getAttachment('imagem');
        const thumbnail = interaction.options.getAttachment('thumbnail');
        const color = interaction.options.get('cor');
        const footer = interaction.options.get('footer');
        const footerIcon = interaction.options.getAttachment('icon-footer');

        if (author == null && title == null && description == null && image == null) {
            interaction.reply('Você não colocou nada!');
            return;
        };

        const embed = new EmbedBuilder();
        if (author != null) {
            if (authorIcon != null) {
                embed.setAuthor({ name: author.value, iconURL: authorIcon.url });
            } else {
                embed.setAuthor({ name: author.value });
            };
        };
        if (title != null) {
            embed.setTitle(title.value);
        };
        if (description != null) {
            embed.setDescription(description.value);
        };
        if (image != null) {
            embed.setImage(image.url)
        };
        if (thumbnail != null) {
            embed.setThumbnail(thumbnail.url)
        };
        if (color != null) {
            embed.setColor(color.value)
        };
        if (footer != null) {
            if (footerIcon != null) {
                embed.setFooter({ text: footer.value, iconURL: footerIcon.url });
            } else {
                embed.setFooter({ text: footer.value });
            };
        };

        channel.send({ embeds: [embed] });
        interaction.reply(`Embed enviada com sucesso em <#${channel.id}>`);
    }
};
