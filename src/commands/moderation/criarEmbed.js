const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    EmbedBuilder,
} = require("discord.js");

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     *
    */

    callback: async (client, interaction) => {
        const user = interaction.user;
        const guild = interaction.guild;

        const channel = interaction.options.getChannel('canal');
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
    },
    name: 'criar-embed',
    description: 'Cria uma embed.',
    options: [
        {
            name: 'canal',
            description: 'Canal aonde você quer enviar a mensagem com a embed.',
            type: ApplicationCommandOptionType.Channel
        },
        {
            name: 'autor',
            description: 'Texto localizado acima de todo o resto da embed.',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'icon-autor',
            description: 'Texto pequeno que fica acima de todo o resto da embed, ao lado do texto do autor.',
            type: ApplicationCommandOptionType.Attachment
        },
        {
            name: 'titulo',
            description: 'Título da embed.',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'desc',
            description: 'Descrição da embed.',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'imagem',
            description: 'Imagem anexada à embed, localizada abaixo do texto.',
            type: ApplicationCommandOptionType.Attachment
        },
        {
            name: 'thumbnail',
            description: 'Imagem pequena localizada ao lado do texto.',
            type: ApplicationCommandOptionType.Attachment
        },
        {
            name: 'cor',
            description: 'Cor da embed em código HEX (#000000).',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'footer',
            description: 'Texto pequeno que fica abaixo de todo o resto da embed.',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'icon-footer',
            description: 'Imagem pequena que fica abaixo de todo o resto da embed, ao lado do texto footer.',
            type: ApplicationCommandOptionType.Attachment
        }
    ]
};