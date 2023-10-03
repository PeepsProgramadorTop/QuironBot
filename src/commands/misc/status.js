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
const sharp = require('sharp');
const axios = require('axios');

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
    
            // Redimensiona a imagem do banner para ficar no tamanho correto.
            const resizedBuffer = await sharp(imageBuffer)
                .resize(958, 400)
                .toBuffer();
    
            // Crie um objeto de anexo com o banner redimensionado.
            const attachment = new AttachmentBuilder(resizedBuffer, { name: 'banner.png' });

            const bannerEmbed = new EmbedBuilder()
                .setAuthor({ name: `${user.username}`, iconURL: user.displayAvatarURL({ size: 1024 }) })
                .setTitle(`Status de ${query.info.name}`)
                .setImage(`attachment://banner.png`);
            const embed = new EmbedBuilder()
                .setDescription(
                    `GERAL:

❤️:dot:Pontos de Vida︰ ${query.info.hitPoints.base}/${query.info.hitPoints.current}
🪙:dot:Dracmas︰ ${query.info.money}

ATRIBUTOS:

🌟:dot:Ponto(s) de Atributos Restante(s)︰ ${query.stats.atrPoints}

🫀:dot:Constituição (CON)︰ ${query.stats.atrCON}
🗡️:dot:Força (FOR)︰ ${query.stats.atrFOR}
🦿:dot:Agilidade (AGI)︰ ${query.stats.atrAGI}
🧠:dot:Inteligência (INT)︰ ${query.stats.atrINT}
✨:dot:Carisma (CAR)︰ ${query.stats.atrCAR}
`
                )
                .setThumbnail(query.info.avatar);

            interaction.reply({ embeds: [bannerEmbed], files: [attachment] });
        });
    },

    name: "status",
    description: "Pega os personagem aí doidão",
};
