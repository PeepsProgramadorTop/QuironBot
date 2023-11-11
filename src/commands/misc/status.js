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
const { createBanner } = require("../../utils/createBanner") ;
const Canvas = require("@napi-rs/canvas");
const { join } = require("path");
Canvas.GlobalFonts.registerFromPath(
    join(__dirname, "../..", "fonts", "gg_sans_medium.ttf"),
    "GG Sans Medium"
);

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