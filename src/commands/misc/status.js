const {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    EmbedBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const axios = require('axios');
const sharp = require('sharp');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    callback: async (client, interaction) => {
        const user = interaction.user;

        const characterGroup = await characterProfile.find({ userID: user.id });

        const names = [];
        characterGroup.forEach((data) => {
            names.push({ name: `${data.info.name}` });
        });

        const charSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder("Selecione o personagem que você quer ver o status.")
            .setMinValues(0)
            .setMaxValues(1)
            .addOptions(
                names.map((characters) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(characters.name)
                        .setDescription("Personagem.")
                        .setValue(characters.name)
                )
            );

        const actionRow = new ActionRowBuilder().addComponents(charSelectMenu);

        const reply = await interaction.reply({
            components: [actionRow],
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) =>
                i.user.id === interaction.user.id && i.customId === interaction.id,
            time: 60_000,
        });

        collector.on("collect", async (interaction) => {
            const character = interaction.values[0];

            const query = await characterProfile.findOne({
                userID: user.id,
                "info.name": character,
            });

            const bannerURL = query.info.banner;
            const response = await axios.get(bannerURL, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            // Redimensiona o GIF usando gif-encoder-2

            const bannerResized = await sharp(imageBuffer)
                .resize(700, 250)
                .toBuffer();
            const canvas = Canvas.createCanvas(700, 250);
            const context = canvas.getContext('2d');

            const background = await Canvas.loadImage(bannerResized);
            const symbol = await Canvas.loadImage('https://cdn.discordapp.com/attachments/1158781690517393418/1158790947069509652/image.png?ex=652eab2b&is=651c362b&hm=43916bbe3e8a1f522461ce3dafdd190cb6678b7500c2a9115797dd668f498c61&');

            // This uses the canvas dimensions to stretch the image onto the entire canvas
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
            context.drawImage(symbol, 20, 170, 60, 60);
            context.drawImage(symbol, 100, 170, 60, 60);
            context.drawImage(symbol, 180, 170, 60, 60);

            const resizedBuffer = await canvas.encode('png')

            // Crie um objeto de anexo com o GIF redimensionado
            const attachment = new AttachmentBuilder(resizedBuffer, { name: `banner.png` });

            const bannerEmbed = new EmbedBuilder()
                .setAuthor({ name: `Interpretado por: ${user.username}`, iconURL: user.displayAvatarURL({ size: 1024 }) })
                .setTitle(`Status de ${query.info.name}`)
                .setImage(`attachment://banner.png`);
            const embed = new EmbedBuilder()
                .setDescription(`\`\`\`GERAL:\`\`\`
❤️<:dot:1158109856725733378>**Pontos de Vida︰** \`${query.info.hitPoints.current}/${query.info.hitPoints.base}HP\`
🪙<:dot:1158109856725733378>**Dracmas︰** \`×${query.info.money}\`
📊<:dot:1158109856725733378>**Nível︰** \`0\`

\`\`\`COLAR DE CONTAS:\`\`\`
<:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034>
                    
\`\`\`ATRIBUTOS:\`\`\`
🌟<:dot:1158109856725733378>**Ponto(s) de Atributos Restante(s)︰** \`×${query.stats.atrPoints}\`

🫀<:dot:1158109856725733378>**Constituição (CON)︰** \`×${query.stats.atrCON}\`
🗡️<:dot:1158109856725733378>**Força (FOR)︰** \`×${query.stats.atrFOR}\`
🦿<:dot:1158109856725733378>**Agilidade (AGI)︰** \`×${query.stats.atrAGI}\`
🧠<:dot:1158109856725733378>**Inteligência (INT)︰** \`×${query.stats.atrINT}\`
✨<:dot:1158109856725733378>**Carisma (CAR)︰** \`×${query.stats.atrCAR}\`
`)
                .setThumbnail(query.info.avatar)
                .setImage("https://i.imgur.com/rg4KxSi.png");

            reply.edit({ embeds: [bannerEmbed, embed], files: [attachment], components: [] });
        });
    },

    name: "status",
    description: "Pega os personagem aí doidão",
};
