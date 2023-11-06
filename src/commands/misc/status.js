const {
    SlashCommandBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
    ButtonBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const axios = require("axios");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");
const { join } = require("path");

Canvas.GlobalFonts.registerFromPath(
    join(__dirname, "../..", "fonts", "gg_sans_medium.ttf"),
    "GG Sans Medium"
);

const adjustedText = (canvas, text) => {
    const context = canvas.getContext('2d');
    context.fillStyle = "#76787b";

    let fontSize = 36;
    let heightSize = 398;

    do {
        context.font = `${fontSize -= 1}px GG Sans Medium`;
    } while (context.measureText(text).width > 950);
    do {
        heightSize = heightSize - 6;
    } while (context.measureText(text).heightSize < 28);

    context.font;
    context.fillText(text, 296, heightSize);
};

const createBanner = async (characterInfo, user) => {
    const playerAvatarURL = user.avatarURL();

    //Avatar do Personagem
    const characterAvatarURL = characterInfo.info.avatar;
    const characterAvatarResponse = await axios.get(characterAvatarURL, { responseType: "arraybuffer" });
    const characterAvatarBuffer = Buffer.from(characterAvatarResponse.data);
    const resizedcharacterAvatar = await sharp(characterAvatarBuffer)
        .resize({
            width: 232,
            height: 232,
            fit: sharp.fit.cover,
            position: sharp.strategy.attention,
        })
        .toBuffer();

    //Banner do Personagem
    const bannerURL = characterInfo.info.banner;
    const bannerResponse = await axios.get(bannerURL, { responseType: "arraybuffer" });
    const bannerBuffer = Buffer.from(bannerResponse.data);
    const resizedBanner = await sharp(bannerBuffer)
        .resize({
            width: 1306,
            height: 400,
            fit: sharp.fit.cover,
            position: sharp.strategy.attention,
        })
        .toBuffer();

    //Criando o Canvas
    const canvas = Canvas.createCanvas(1306, 814);
    const context = canvas.getContext("2d");

    //Carregando Informações Básicas
    const banner = await Canvas.loadImage(resizedBanner);
    const statusLayer = await Canvas.loadImage("./src/images/status_layer.png");
    const characterAvatar = await Canvas.loadImage(resizedcharacterAvatar);
    const playerAvatar = await Canvas.loadImage(playerAvatarURL);

    //Carregando Ícones dos Chalés
    const zeusCabin = await Canvas.loadImage("./src/images/chalé_zeus.png");
    const poseidonCabin = await Canvas.loadImage("./src/images/chalé_poseidon.png");
    const demeterCabin = await Canvas.loadImage("./src/images/chalé_deméter.png");
    const aresCabin = await Canvas.loadImage("./src/images/chalé_ares.png");
    const athenaCabin = await Canvas.loadImage("./src/images/chalé_atena.png");
    const apolloCabin = await Canvas.loadImage("./src/images/chalé_apolo.png");
    const arthemisCabin = await Canvas.loadImage("./src/images/chalé_ártemis.png");
    const aphroditeCabin = await Canvas.loadImage("./src/images/chalé_afrodite.png");
    const hephaestusCabin = await Canvas.loadImage("./src/images/chalé_hefesto.png");
    const hermesCabin = await Canvas.loadImage("./src/images/chalé_hermes.png");
    const dionysusCabin = await Canvas.loadImage("./src/images/chalé_dionísio.png");
    const hadesCabin = await Canvas.loadImage("./src/images/chalé_hades.png");
    const irisCabin = await Canvas.loadImage("./src/images/chalé_íris.png");
    const hypnosCabin = await Canvas.loadImage("./src/images/chalé_hipnos.png");
    const nemesisCabin = await Canvas.loadImage("./src/images/chalé_nêmesis.png");
    const nikeCabin = await Canvas.loadImage("./src/images/chalé_nike.png");
    const hebeCabin = await Canvas.loadImage("./src/images/chalé_hebe.png");
    const tycheCabin = await Canvas.loadImage("./src/images/chalé_tique.png");
    const hekateCabin = await Canvas.loadImage("./src/images/chalé_hécate.png");

    //Desenhando o Banner
    context.save(); //Salva
    context.beginPath();
    context.roundRect(0, 0, 1306, 310, 12);
    context.closePath();
    context.clip();
    context.drawImage(banner, 0, 0, 1306, 400);
    context.restore(); //Restaura

    context.drawImage(statusLayer, 0, 0, canvas.width, canvas.height); //Desenhando a layer em cima do banner

    //Desenhando o avatar do personagem
    context.save(); //Salva
    context.beginPath();
    context.arc(163, 302, 116, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    context.drawImage(characterAvatar, 47, 186, 232, 232);
    context.restore(); //Restaura

    //Desenhando o avatar do jogador
    context.save(); //Salva
    context.beginPath();
    context.arc(311.5, 423.5, 17.5, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    context.drawImage(playerAvatar, 294, 406, 35, 35);
    context.restore(); //Restaura

    //Nome do Personagem
    context.font = "40px GG Sans Medium";
    context.fillStyle = "#f7f7f7";
    context.fillText(
        `${characterInfo.info.displayName.replace(/[^a-zA-Z0-9\s\-—]+/g, "").replace(/^(?:\s|\p{Emoji})+/gu, "")}`,
        296,
        354
    );

    //Apelidos do Personagem
    adjustedText(canvas, characterInfo.info.nicknames);

    //Nome de usuário do jogador
    context.font = "29px GG Sans Medium";
    context.fillStyle = "#828487";
    context.fillText(`@${user.username}`, 338, 433);

    //Informações gerais do personagem (HP, dinheiro, nível, mana, etc...)
    context.font = "24px GG Sans Medium";
    context.fillStyle = "#f7f7f7";
    context.fillText(
        `${characterInfo.info.hitPoints.current}/${characterInfo.info.hitPoints.base}HP`,
        802,
        692
    );
    context.fillText(
        `${characterInfo.info.money} dracma${characterInfo.info.money > 1 ? "s" : ""}`,
        1065,
        692
    );
    context.fillText(`Nível ${characterInfo.info.xp}`, 802, 751);
    context.fillText(
        `${characterInfo.info.mana.current}/${characterInfo.info.mana.base} Mana`,
        1065,
        751
    );

    //Atributos
    context.font = "24px GG Sans Medium";
    context.fillStyle = "#76787B";
    context.fillText(`×${characterInfo.stats.atrPoints}`, 305, 587);
    context.fillText(`×${characterInfo.stats.atrCON}`, 305, 660);
    context.fillText(`×${characterInfo.stats.atrFOR}`, 228, 708);
    context.fillText(`×${characterInfo.stats.atrAGI}`, 260, 756);
    context.fillText(`×${characterInfo.stats.atrINT}`, 637, 660);
    context.fillText(`×${characterInfo.stats.atrSAB}`, 631, 708);
    context.fillText(`×${characterInfo.stats.atrCAR}`, 613, 756);

    //Desenhando o ícone do chalé do personagem
    switch (characterInfo.info.cabin) {
        case "Zeus":
            context.drawImage(zeusCabin, 308, 231, 336, 59);
            break;
        case "Poseidon":
            context.drawImage(poseidonCabin, 308, 231, 336, 59);
            break;
        case "Demeter":
            context.drawImage(demeterCabin, 308, 231, 336, 59);
            break;
        case "Ares":
            context.drawImage(aresCabin, 308, 231, 336, 59);
            break;
        case "Atena":
            context.drawImage(athenaCabin, 308, 231, 336, 59);
            break;
        case "Apolo":
            context.drawImage(apolloCabin, 308, 231, 336, 59);
            break;
        case "Ártemis":
            context.drawImage(arthemisCabin, 308, 231, 336, 59);
            break;
        case "Hefesto":
            context.drawImage(hephaestusCabin, 308, 231, 336, 59);
            break;
        case "Afrodite":
            context.drawImage(aphroditeCabin, 308, 231, 336, 59);
            break;
        case "Hermes":
            context.drawImage(hermesCabin, 308, 231, 336, 59);
            break;
        case "Dionísio":
            context.drawImage(dionysusCabin, 308, 231, 336, 59);
            break;
        case "Hades":
            context.drawImage(hadesCabin, 308, 231, 336, 59);
            break;
        case "Íris":
            context.drawImage(irisCabin, 308, 231, 336, 59);
            break;
        case "Hipnos":
            context.drawImage(hypnosCabin, 308, 231, 336, 59);
            break;
        case "Nêmesis":
            context.drawImage(nemesisCabin, 308, 231, 336, 59);
            break;
        case "Nike":
            context.drawImage(nikeCabin, 308, 231, 336, 59);
            break;
        case "Hebe":
            context.drawImage(hebeCabin, 308, 231, 336, 59);
            break;
        case "Tique":
            context.drawImage(tycheCabin, 308, 231, 336, 59);
            break;
        case "Hécate":
            context.drawImage(hekateCabin, 308, 231, 336, 59);
            break;
    }

    return canvas.encode("png");
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Retorna o perfil do personagem escolhido."),
    run: async ({ interaction }) => {
        const user = interaction.user;
        const characterGroup = await characterProfile.find({ userID: user.id });
        const names = characterGroup.map((data) => ({
            name: data.info.name,
            displayName: data.info.displayName,
            cabin: data.info.cabin
        }));

        if (names.length == 1) {
            const characterInfo = await characterProfile.findOne({
                userID: user.id,
                "info.name": names[0].name,
            });

            const banner = await createBanner(characterInfo, user);
            const attachment = new AttachmentBuilder(banner, {
                name: `banner.png`,
            });

            interaction.reply({
                content: "",
                files: [attachment],
                components: [],
            });
        } else if (names.length > 1) {
            const emojiMap = {
                Zeus: "⚡",
                Poseidon: "🌊",
                Demeter: "🌻",
                Ares: "🪖",
                Atena: "🦉",
                Apolo: "☀️",
                Ártemis: "🏹",
                Hefesto: "🔨",
                Afrodite: "💘",
                Hermes: "<:hermes_symbol:1168239283958718476>",
                Dionísio: "🍷",
                Hades: "💀",
                Íris: "🌈",
                Hipnos: "💤",
                Nêmesis: "⚖️",
                Nike: "🏅",
                Hebe: "🥂",
                Tique: "🎲",
                Hécate: "🌙",
            };
            const charSelectMenu = new StringSelectMenuBuilder()
                .setCustomId("selectCharacterMenu")
                .setPlaceholder("Selecione aqui.")
                .setMinValues(0)
                .setMaxValues(1)
                .addOptions(names.map((characters) => {
                    const cabin = characters.cabin;
                    const emoji = emojiMap[cabin] || "❓"; // Default emoji if cabin not found
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(characters.displayName)
                        .setDescription(`Veja o status de ${characters.displayName}!`)
                        .setValue(characters.name)
                        .setEmoji(emoji);
                }));
            const actionRow = new ActionRowBuilder().addComponents(charSelectMenu);

            const reply = await interaction.reply({
                content: "Selecione abaixo um de seus personagens para ver seu status.",
                components: [actionRow],
            });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) =>
                    i.user.id === interaction.user.id &&
                    i.customId === "selectCharacterMenu",
                time: 60_000,
            });
            collector.on("collect", async (interaction) => {
                const character = interaction.values[0];
                const characterInfo = await characterProfile.findOne({
                    userID: user.id,
                    "info.name": character,
                });

                const banner = await createBanner(characterInfo, user);
                const attachment = new AttachmentBuilder(banner, {
                    name: "banner.png",
                });

                const atrSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId("atrSelectMenu")
                    .setPlaceholder("Selecione aqui qual dos atributos você quer editar.")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Contituição (CON)")
                            .setDescription(`Altere os valores da Constituição de seu personagem.`)
                            .setValue("editAtrCON")
                            .setEmoji("🫀"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Força (FOR)")
                            .setDescription(`Altere os valores da Força de seu personagem.`)
                            .setValue("editAtrFOR")
                            .setEmoji("🗡️"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Agilidade (AGI)")
                            .setDescription(`Altere os valores da Agilidade de seu personagem.`)
                            .setValue("editAtrAGI")
                            .setEmoji("🦿"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Inteligência (INT)")
                            .setDescription(`Altere os valores da Inteligência de seu personagem.`)
                            .setValue("editAtrINT")
                            .setEmoji("📜"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Sabedoria (SAB)")
                            .setDescription(`Altere os valores da Sabedoria de seu personagem.`)
                            .setValue("editAtrSAB")
                            .setEmoji("🦉"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Carisma (CAR)")
                            .setDescription(`Altere os valores da Carisma de seu personagem.`)
                            .setValue("editAtrCAR")
                            .setEmoji("✨"),
                    );
                const editInfoButton = new ButtonBuilder()
                    .setCustomId("editInfoButton")
                    .setLabel("Alterar as Informações")
                    .setEmoji("📝")
                    .setStyle("Secondary");
                const editImagesButton = new ButtonBuilder()
                    .setCustomId("editImagesButton")
                    .setLabel("Alterar Avatar e Banner")
                    .setEmoji("🖼️")
                    .setStyle("Secondary");

                const firstActionRow = new ActionRowBuilder().addComponents(atrSelectMenu);
                const secondActionRow = new ActionRowBuilder().addComponents(editInfoButton, editImagesButton);

                await interaction.deferUpdate();
                const reply = await interaction.message.edit({
                    content: "",
                    files: [attachment],
                    components: [firstActionRow, secondActionRow],
                });

                const collectorEditInfo = reply.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter: (i) =>
                        i.user.id === interaction.user.id && i.customId === "editInfoButton",
                });
                collectorEditInfo.on("collect", async (interaction) => {
                    //Informações do Personagem Atualizadas
                    const updatedcharacterInfo = await characterProfile.findOne({
                        userID: user.id,
                        "info.name": character,
                    });

                    //Construindo o Modal
                    const modal = new ModalBuilder()
                        .setCustomId("editCharModal")
                        .setTitle("Editar Personagem");
                    const nameInput = new TextInputBuilder()
                        .setCustomId("nameInput")
                        .setLabel("Nome:")
                        .setPlaceholder("Digite o novo nome para seu personagem aqui.")
                        .setValue(`${updatedcharacterInfo.info.displayName}`)
                        .setStyle(TextInputStyle.Short);
                    const nicknamesInput = new TextInputBuilder()
                        .setCustomId("nicknamesInput")
                        .setLabel("Apelidos:")
                        .setPlaceholder("Digite os novos apelidos para seu personagem aqui.")
                        .setValue(`${updatedcharacterInfo.info.nicknames}`)
                        .setStyle(TextInputStyle.Paragraph);

                    //ActionRows
                    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(nicknamesInput);

                    //Adicionar componentes ao modal
                    modal.addComponents(firstActionRow, secondActionRow);

                    await interaction.showModal(modal); //Mostrar modal para o usuário

                    interaction.awaitModalSubmit({
                        filter: (i) =>
                            i.user.id === interaction.user.id &&
                            i.customId === "editCharModal",
                        time: 5 * 60_000,
                    }).then(async (modalInteraction) => {
                        const newName = modalInteraction.fields.getTextInputValue("nameInput");
                        const newNicknames = modalInteraction.fields.getTextInputValue("nicknamesInput");

                        const newInfo = await characterProfile.findOneAndUpdate(
                            {
                                userID: user.id,
                                "info.name": character,
                            },
                            {
                                "info.displayName": newName,
                                "info.nicknames": newNicknames,
                            },
                            {
                                returnOriginal: false,
                            }
                        );

                        const banner = await createBanner(newInfo, user);
                        const attachment = new AttachmentBuilder(banner, {
                            name: "banner.png",
                        });

                        modalInteraction.reply({
                            content: "Informações alteradas com sucesso!",
                            ephemeral: true,
                        });
                        interaction.message.edit({
                            content: "",
                            files: [attachment],
                        })
                    })
                })
            })
        }
    },
};