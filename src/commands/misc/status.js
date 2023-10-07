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
const { join } = require('path')

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 42;

	do {
		context.font = `${fontSize -= 10}px Windlass`;
	} while (context.measureText(text).width > canvas.width - 400);

	return context.font;
};

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

            // ------------------------------------
            // Abaixo se inicia a criação do banner!
            // ------------------------------------

            const bannerURL = query.info.banner;
            const characterAvatarURL = query.info.avatar;
            const response = await axios.get(bannerURL, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);
            Canvas.GlobalFonts.registerFromPath(join(__dirname, '../..', 'fonts', 'windlass.ttf'), 'Windlass');


            //Separação - Das consts default para a criação do background.

            const resizedBanner = await sharp(imageBuffer)
                .resize(1079, 353)
                .toBuffer();

            const backgroundCanvas = Canvas.createCanvas(1079, 486);
            const backgroundContext = backgroundCanvas.getContext('2d');

            const background = await Canvas.loadImage(resizedBanner);

            backgroundContext.fillStyle = '#03a9f4'
            backgroundContext.beginPath();
            backgroundContext.roundRect(0, 0, 1079, 400, 42);
            backgroundContext.closePath();
            backgroundContext.clip();

            backgroundContext.drawImage(background, 0, 0, 1079, 353);

            const bannerBackground = backgroundCanvas.toBuffer('image/png');

            //Separação - Da criação do background para a layer superior do banner.

            const layerCanvas = Canvas.createCanvas(1079, 486);
            const layerContext = layerCanvas.getContext('2d');

            const backgroundBuffer = await Canvas.loadImage(bannerBackground);
            const bannerLayer = await Canvas.loadImage('./src/images/banner_layer.png');
            const characterAvatar = await Canvas.loadImage(characterAvatarURL);

            layerContext.drawImage(backgroundBuffer, 0, 0, layerCanvas.width, layerCanvas.height);
            layerContext.drawImage(bannerLayer, 0, 0, layerCanvas.width, layerCanvas.height);
            layerContext.font = applyText(layerCanvas, `${query.info.name}`);
            layerContext.fillStyle = '#FFFFFF';
            layerContext.fillText(`${query.info.name}`, 290, 418);
            layerContext.font = '29px Calibri';
            layerContext.fillStyle = '#4E4F54';
            layerContext.fillText(`@${user.username}`, 290, 443);

            layerContext.beginPath();
            layerContext.arc(146, 348, 108, 0, Math.PI * 2, true);
            layerContext.closePath();
            layerContext.clip();
            layerContext.drawImage(characterAvatar, 38, 240, 216, 216);

            const resizedBuffer = await layerCanvas.encode('png');

            const attachment = new AttachmentBuilder(resizedBuffer, { name: `banner.png` });

            // ------------------------------------
            // Aqui termina-se a criação do banner e se inicia a criação e o processo de enviar as embeds.
            // ------------------------------------

            const firstEmbed = new EmbedBuilder()
                .setAuthor({ name: `Quíron lhe apresenta...`, iconURL: 'https://i.imgur.com/3LUWvgi.png' })
                .setTitle(`📂  —  Arquivo de Semideus(a)︰`)
                .setImage(`attachment://banner.png`);
            const secondEmbed = new EmbedBuilder()
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
                .setImage("https://i.imgur.com/rg4KxSi.png");

            reply.edit({ embeds: [firstEmbed, secondEmbed], files: [attachment], components: [] });
        });
    },

    name: "status",
    description: "Pega os personagem aí doidão",
};
