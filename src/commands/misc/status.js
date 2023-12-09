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
const { createBanner } = require("../../utils/createBanner");
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
        const { user } = interaction;

        const characterGroup = await characterProfile.find({ userID: user.id });
        const names = characterGroup.map((data) => ({
            name: data.info.name,
            cabin: data.info.cabin
        }));

        switch (names.length) {
            case 0:
                interaction.reply("Você não tem um personagem.")
                break;
            case 1:
                const characterInfo = await characterProfile.findOne({
                    userID: user.id,
                    "info.name": names[0].name,
                });

                const character = characterInfo.info.name;

                const banner = await createBanner(characterInfo, user);
                const attachment = new AttachmentBuilder(banner, { name: `banner.png` });

                const firstActionRow = {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 3, // String Select Menu
                            custom_id: "atrSelectMenu",
                            placeholder: "Selecione aqui qual dos atributos você quer editar.",
                            min_values: 0,
                            max_values: 1,
                            options: [
                                {
                                    label: "Contituição (CON)",
                                    description: "Altere os valores da Constituição de seu personagem.",
                                    value: "editAtrCON",
                                    emoji: "🫀",
                                },
                                {
                                    label: "Força (FOR)",
                                    description: "Altere os valores da Força de seu personagem.",
                                    value: "editAtrFOR",
                                    emoji: "🗡️",
                                },
                                {
                                    label: "Agilidade (AGI)",
                                    description: "Altere os valores da Agilidade de seu personagem.",
                                    value: "editAtrAGI",
                                    emoji: "🦿",
                                },
                                {
                                    label: "Inteligência (INT)",
                                    description: "Altere os valores da Inteligência de seu personagem.",
                                    value: "editAtrINT",
                                    emoji: "📜",
                                },
                                {
                                    label: "Sabedoria (SAB)",
                                    description: "Altere os valores da Sabedoria de seu personagem.",
                                    value: "editAtrSAB",
                                    emoji: "🦉",
                                },
                                {
                                    label: "Carisma (CAR)",
                                    description: "Altere os valores da Carisma de seu personagem.",
                                    value: "editAtrCAR",
                                    emoji: "✨",
                                },
                            ],
                        },
                    ],
                };
                const secondActionRow = {
                    type: 1, //Action Row
                    components: [
                        {
                            type: 2, //Botão - Alterar as Informações
                            custom_id: "editInfoButton",
                            label: "Alterar as Informações",
                            emoji: "📝",
                            style: 2 // Secondary
                        },
                        {
                            type: 2, //Botão - Alterar Avatar e Banner
                            disabled: true,
                            custom_id: "editImagesButton",
                            label: "Avatar e Banner só são editáveis por comandos.",
                            emoji: "🖼️",
                            style: 2 // Secondary
                        },
                    ],
                };

                const oneCharReply = await interaction.reply({
                    content: "",
                    files: [attachment],
                    components: [firstActionRow, secondActionRow],
                });

                const collectorEditInfo = oneCharReply.createMessageComponentCollector({
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
                    const modal = {
                        title: "Editar Personagem",
                        custom_id: "editCharModal",
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 4,
                                        custom_id: "prefixInput",
                                        label: "Prefixo:",
                                        placeholder: "Digite o novo prefixo para seu personagem aqui.",
                                        value: updatedcharacterInfo.info.prefix,
                                        min_length: 1,
                                        max_length: 4000,
                                        style: 1,
                                        required: true
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 4,
                                        custom_id: "nameInput",
                                        label: "Nome:",
                                        placeholder: "Digite o novo nome para seu personagem aqui.",
                                        value: updatedcharacterInfo.info.name,
                                        min_length: 1,
                                        max_length: 4000,
                                        style: 1,
                                        required: true
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 4,
                                        custom_id: "nicknamesInput",
                                        label: "Apelidos:",
                                        placeholder: "Digite os novos apelidos para seu personagem aqui.",
                                        value: updatedcharacterInfo.info.nicknames,
                                        min_length: 1,
                                        max_length: 4000,
                                        style: 2,
                                        required: true
                                    }
                                ]
                            }
                        ]
                    };

                    await interaction.showModal(modal); //Mostrar modal para o usuário

                    interaction.awaitModalSubmit({
                        filter: (i) =>
                            i.user.id === interaction.user.id &&
                            i.customId === "editCharModal",
                        time: 5 * 60_000,
                    }).then(async (modalInteraction) => {
                        const newPrefix = modalInteraction.fields.getTextInputValue("prefixInput");
                        const newName = modalInteraction.fields.getTextInputValue("nameInput");
                        const newNicknames = modalInteraction.fields.getTextInputValue("nicknamesInput");

                        const newInfo = await characterProfile.findOneAndUpdate(
                            {
                                userID: user.id,
                                "info.name": character,
                            },
                            {
                                "info.prefix": newPrefix,
                                "info.name": newName,
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

                const collectorAtr = oneCharReply.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    filter: (i) =>
                        i.user.id === interaction.user.id &&
                        i.customId === "atrSelectMenu",
                    time: 60_000,
                });
                collectorAtr.on("collect", async (interaction) => {
                    //Informações do Personagem Atualizadas
                    const updatedcharacterInfo = await characterProfile.findOne({
                        userID: user.id,
                        "info.name": character,
                    });

                    switch (interaction.values[0]) {
                        case "editAtrCON":
                            const CONModal = {
                                title: "Editar Atributo - Constituição (CON)",
                                custom_id: "editCONModal",
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                custom_id: "quantityCON",
                                                label: "Quantidade:",
                                                placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a estre atributo.",
                                                min_length: 1,
                                                max_length: 3,
                                                style: 1,
                                                required: true
                                            }
                                        ]
                                    }
                                ]
                            };

                            await interaction.showModal(CONModal); //Mostrar modal para o usuário

                            interaction.awaitModalSubmit({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId === "editCONModal",
                                time: 5 * 60_000,
                            }).then(async (modalInteraction) => {
                                const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityCON"));
                                const currentQuantity = updatedcharacterInfo.stats.atrCON;
                                const quantity = quantityToAdd + currentQuantity;

                                const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                    modalInteraction.reply({
                                        content: "Você tem que colocar um número positivo válido.",
                                        ephemeral: true,
                                    });
                                    return;
                                };
                                if (atrPoints < 0) {
                                    modalInteraction.reply({
                                        content: "Você não tem pontos suficientes para esta ação.",
                                        ephemeral: true,
                                    });
                                    return;
                                };

                                const newInfo = await characterProfile.findOneAndUpdate(
                                    {
                                        userID: user.id,
                                        "info.name": character,
                                    },
                                    {
                                        "stats.atrPoints": atrPoints,
                                        "stats.atrCON": quantity
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
                                    content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Constituição (CON)! Agora você possui ${newInfo.stats.atrCON} pontos neste atributo!`,
                                    ephemeral: true,
                                });
                                interaction.message.edit({
                                    content: "",
                                    files: [attachment],
                                })
                            })
                            break;

                        case "editAtrFOR":
                            const FORModal = {
                                title: "Editar Atributo - Força (FOR)",
                                custom_id: "editFORModal",
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                custom_id: "quantityFOR",
                                                label: "Quantidade:",
                                                placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                min_length: 1,
                                                max_length: 3,
                                                style: 1,
                                                required: true
                                            }
                                        ]
                                    }
                                ]
                            };

                            await interaction.showModal(FORModal);

                            interaction.awaitModalSubmit({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId === "editFORModal",
                                time: 5 * 60_000,
                            }).then(async (modalInteraction) => {
                                const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityFOR"));
                                const currentQuantity = updatedcharacterInfo.stats.atrFOR;
                                const quantity = quantityToAdd + currentQuantity;

                                const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                    modalInteraction.reply({
                                        content: "Você tem que colocar um número positivo válido.",
                                        ephemeral: true,
                                    });
                                    return;
                                };
                                if (atrPoints < 0) {
                                    modalInteraction.reply({
                                        content: "Você não tem pontos suficientes para esta ação.",
                                        ephemeral: true,
                                    });
                                    return;
                                };

                                const newInfo = await characterProfile.findOneAndUpdate(
                                    {
                                        userID: user.id,
                                        "info.name": character,
                                    },
                                    {
                                        "stats.atrPoints": atrPoints,
                                        "stats.atrFOR": quantity
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
                                    content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Força (FOR)! Agora você possui ${newInfo.stats.atrFOR} pontos neste atributo!`,
                                    ephemeral: true,
                                });
                                interaction.message.edit({
                                    content: "",
                                    files: [attachment],
                                });
                            });
                            break;

                        case "editAtrAGI":
                            const AGIModal = {
                                title: "Editar Atributo - Agilidade (AGI)",
                                custom_id: "editAGIModal",
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                custom_id: "quantityAGI",
                                                label: "Quantidade:",
                                                placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                min_length: 1,
                                                max_length: 3,
                                                style: 1,
                                                required: true
                                            }
                                        ]
                                    }
                                ]
                            };

                            await interaction.showModal(AGIModal);

                            interaction.awaitModalSubmit({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId === "editAGIModal",
                                time: 5 * 60_000,
                            }).then(async (modalInteraction) => {
                                const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityAGI"));
                                const currentQuantity = updatedcharacterInfo.stats.atrAGI;
                                const quantity = quantityToAdd + currentQuantity;

                                const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                    modalInteraction.reply({
                                        content: "Você tem que colocar um número positivo válido.",
                                        ephemeral: true,
                                    });
                                    return;
                                };
                                if (atrPoints < 0) {
                                    modalInteraction.reply({
                                        content: "Você não tem pontos suficientes para esta ação.",
                                        ephemeral: true,
                                    });
                                    return;
                                };

                                const newInfo = await characterProfile.findOneAndUpdate(
                                    {
                                        userID: user.id,
                                        "info.name": character,
                                    },
                                    {
                                        "stats.atrPoints": atrPoints,
                                        "stats.atrAGI": quantity
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
                                    content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Agilidade (AGI)! Agora você possui ${newInfo.stats.atrAGI} pontos neste atributo!`,
                                    ephemeral: true,
                                });
                                interaction.message.edit({
                                    content: "",
                                    files: [attachment],
                                });
                            });
                            break;
                        case "editAtrINT":
                            const INTModal = {
                                title: "Editar Atributo - Inteligência (INT)",
                                custom_id: "editINTModal",
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                custom_id: "quantityINT",
                                                label: "Quantidade:",
                                                placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                min_length: 1,
                                                max_length: 3,
                                                style: 1,
                                                required: true
                                            }
                                        ]
                                    }
                                ]
                            };

                            await interaction.showModal(INTModal);

                            interaction.awaitModalSubmit({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId === "editINTModal",
                                time: 5 * 60_000,
                            }).then(async (modalInteraction) => {
                                const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityINT"));
                                const currentQuantity = updatedcharacterInfo.stats.atrINT;
                                const quantity = quantityToAdd + currentQuantity;

                                const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                    modalInteraction.reply({
                                        content: "Você tem que colocar um número positivo válido.",
                                        ephemeral: true,
                                    });
                                    return;
                                };
                                if (atrPoints < 0) {
                                    modalInteraction.reply({
                                        content: "Você não tem pontos suficientes para esta ação.",
                                        ephemeral: true,
                                    });
                                    return;
                                };

                                const newInfo = await characterProfile.findOneAndUpdate(
                                    {
                                        userID: user.id,
                                        "info.name": character,
                                    },
                                    {
                                        "stats.atrPoints": atrPoints,
                                        "stats.atrINT": quantity
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
                                    content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Inteligência (INT)! Agora você possui ${newInfo.stats.atrINT} pontos neste atributo!`,
                                    ephemeral: true,
                                });
                                interaction.message.edit({
                                    content: "",
                                    files: [attachment],
                                });
                            });
                            break;
                        case "editAtrSAB":
                            const SABModal = {
                                title: "Editar Atributo - Sabedoria (SAB)",
                                custom_id: "editSABModal",
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                custom_id: "quantitySAB",
                                                label: "Quantidade:",
                                                placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                min_length: 1,
                                                max_length: 3,
                                                style: 1,
                                                required: true
                                            }
                                        ]
                                    }
                                ]
                            };

                            await interaction.showModal(SABModal);

                            interaction.awaitModalSubmit({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId === "editSABModal",
                                time: 5 * 60_000,
                            }).then(async (modalInteraction) => {
                                const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantitySAB"));
                                const currentQuantity = updatedcharacterInfo.stats.atrSAB;
                                const quantity = quantityToAdd + currentQuantity;

                                const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                    modalInteraction.reply({
                                        content: "Você tem que colocar um número positivo válido.",
                                        ephemeral: true,
                                    });
                                    return;
                                };
                                if (atrPoints < 0) {
                                    modalInteraction.reply({
                                        content: "Você não tem pontos suficientes para esta ação.",
                                        ephemeral: true,
                                    });
                                    return;
                                };

                                const newInfo = await characterProfile.findOneAndUpdate(
                                    {
                                        userID: user.id,
                                        "info.name": character,
                                    },
                                    {
                                        "stats.atrPoints": atrPoints,
                                        "stats.atrSAB": quantity
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
                                    content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Sabedoria (SAB)! Agora você possui ${newInfo.stats.atrSAB} pontos neste atributo!`,
                                    ephemeral: true,
                                });
                                interaction.message.edit({
                                    content: "",
                                    files: [attachment],
                                });
                            });
                            break;
                        case "editAtrCAR":
                            const CARModal = {
                                title: "Editar Atributo - Carisma (CAR)",
                                custom_id: "editCARModal",
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                custom_id: "quantityCAR",
                                                label: "Quantidade:",
                                                placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                min_length: 1,
                                                max_length: 3,
                                                style: 1,
                                                required: true
                                            }
                                        ]
                                    }
                                ]
                            };

                            await interaction.showModal(CARModal);

                            interaction.awaitModalSubmit({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId === "editCARModal",
                                time: 5 * 60_000,
                            }).then(async (modalInteraction) => {
                                const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityCAR"));
                                const currentQuantity = updatedcharacterInfo.stats.atrCAR;
                                const quantity = quantityToAdd + currentQuantity;

                                const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                    modalInteraction.reply({
                                        content: "Você tem que colocar um número positivo válido.",
                                        ephemeral: true,
                                    });
                                    return;
                                };
                                if (atrPoints < 0) {
                                    modalInteraction.reply({
                                        content: "Você não tem pontos suficientes para esta ação.",
                                        ephemeral: true,
                                    });
                                    return;
                                };

                                const newInfo = await characterProfile.findOneAndUpdate(
                                    {
                                        userID: user.id,
                                        "info.name": character,
                                    },
                                    {
                                        "stats.atrPoints": atrPoints,
                                        "stats.atrCAR": quantity
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
                                    content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Carisma (CAR)! Agora você possui ${newInfo.stats.atrCAR} pontos neste atributo!`,
                                    ephemeral: true,
                                });
                                interaction.message.edit({
                                    content: "",
                                    files: [attachment],
                                });
                            });
                            break;
                    }
                })
                break;
            default:
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

                const actionRow = {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 3, // String Select Menu
                            custom_id: "selectCharacterMenu",
                            placeholder: "Selecione aqui...",
                            min_values: 0,
                            max_values: 1,
                            options: names.map((characters) => {
                                const emoji = emojiMap[characters.cabin] || "❓"; // Se cabine por algum motivo não existir, coloque este emoji.
                                return {
                                    label: characters.name,
                                    value: characters.name,
                                    description: `Veja o status de ${characters.name}!`,
                                    emoji: emoji,
                                };
                            }),
                        },
                    ],
                };

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

                    const firstActionRow = {
                        type: 1, // Action Row
                        components: [
                            {
                                type: 3, // String Select Menu
                                custom_id: "atrSelectMenu",
                                placeholder: "Selecione aqui qual dos atributos você quer editar.",
                                min_values: 0,
                                max_values: 1,
                                options: [
                                    {
                                        label: "Contituição (CON)",
                                        description: "Altere os valores da Constituição de seu personagem.",
                                        value: "editAtrCON",
                                        emoji: "🫀",
                                    },
                                    {
                                        label: "Força (FOR)",
                                        description: "Altere os valores da Força de seu personagem.",
                                        value: "editAtrFOR",
                                        emoji: "🗡️",
                                    },
                                    {
                                        label: "Agilidade (AGI)",
                                        description: "Altere os valores da Agilidade de seu personagem.",
                                        value: "editAtrAGI",
                                        emoji: "🦿",
                                    },
                                    {
                                        label: "Inteligência (INT)",
                                        description: "Altere os valores da Inteligência de seu personagem.",
                                        value: "editAtrINT",
                                        emoji: "📜",
                                    },
                                    {
                                        label: "Sabedoria (SAB)",
                                        description: "Altere os valores da Sabedoria de seu personagem.",
                                        value: "editAtrSAB",
                                        emoji: "🦉",
                                    },
                                    {
                                        label: "Carisma (CAR)",
                                        description: "Altere os valores da Carisma de seu personagem.",
                                        value: "editAtrCAR",
                                        emoji: "✨",
                                    },
                                ],
                            },
                        ],
                    };
                    const secondActionRow = {
                        type: 1, //Action Row
                        components: [
                            {
                                type: 2, //Botão - Alterar as Informações
                                custom_id: "editInfoButton",
                                label: "Alterar as Informações",
                                emoji: "📝",
                                style: 2 // Secondary
                            },
                            {
                                type: 2, //Botão - Alterar Avatar e Banner
                                disabled: true,
                                custom_id: "editImagesButton",
                                label: "Avatar e Banner só são editáveis por comandos.",
                                emoji: "🖼️",
                                style: 2 // Secondary
                            },
                        ],
                    };

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
                        const modal = {
                            title: "Editar Personagem",
                            custom_id: "editCharModal",
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 4,
                                            custom_id: "prefixInput",
                                            label: "Prefixo:",
                                            placeholder: "Digite o novo prefixo para seu personagem aqui.",
                                            value: updatedcharacterInfo.info.prefix,
                                            min_length: 1,
                                            max_length: 4000,
                                            style: 1,
                                            required: true
                                        }
                                    ]
                                },
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 4,
                                            custom_id: "nameInput",
                                            label: "Nome:",
                                            placeholder: "Digite o novo nome para seu personagem aqui.",
                                            value: updatedcharacterInfo.info.name,
                                            min_length: 1,
                                            max_length: 4000,
                                            style: 1,
                                            required: true
                                        }
                                    ]
                                },
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 4,
                                            custom_id: "nicknamesInput",
                                            label: "Apelidos:",
                                            placeholder: "Digite os novos apelidos para seu personagem aqui.",
                                            value: updatedcharacterInfo.info.nicknames,
                                            min_length: 1,
                                            max_length: 4000,
                                            style: 2,
                                            required: true
                                        }
                                    ]
                                }
                            ]
                        };

                        await interaction.showModal(modal); //Mostrar modal para o usuário

                        interaction.awaitModalSubmit({
                            filter: (i) =>
                                i.user.id === interaction.user.id &&
                                i.customId === "editCharModal",
                            time: 5 * 60_000,
                        }).then(async (modalInteraction) => {
                            const newPrefix = modalInteraction.fields.getTextInputValue("prefixInput");
                            const newName = modalInteraction.fields.getTextInputValue("nameInput");
                            const newNicknames = modalInteraction.fields.getTextInputValue("nicknamesInput");

                            const newInfo = await characterProfile.findOneAndUpdate(
                                {
                                    userID: user.id,
                                    "info.name": character,
                                },
                                {
                                    "info.prefix": newPrefix,
                                    "info.name": newName,
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

                    const collectorAtr = reply.createMessageComponentCollector({
                        componentType: ComponentType.StringSelect,
                        filter: (i) =>
                            i.user.id === interaction.user.id &&
                            i.customId === "atrSelectMenu",
                        time: 60_000,
                    });
                    collectorAtr.on("collect", async (interaction) => {
                        //Informações do Personagem Atualizadas
                        const updatedcharacterInfo = await characterProfile.findOne({
                            userID: user.id,
                            "info.name": character,
                        });

                        switch (interaction.values[0]) {
                            case "editAtrCON":
                                const CONModal = {
                                    title: "Editar Atributo - Constituição (CON)",
                                    custom_id: "editCONModal",
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: "quantityCON",
                                                    label: "Quantidade:",
                                                    placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a estre atributo.",
                                                    min_length: 1,
                                                    max_length: 3,
                                                    style: 1,
                                                    required: true
                                                }
                                            ]
                                        }
                                    ]
                                };

                                await interaction.showModal(CONModal); //Mostrar modal para o usuário

                                interaction.awaitModalSubmit({
                                    filter: (i) =>
                                        i.user.id === interaction.user.id &&
                                        i.customId === "editCONModal",
                                    time: 5 * 60_000,
                                }).then(async (modalInteraction) => {
                                    const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityCON"));
                                    const currentQuantity = updatedcharacterInfo.stats.atrCON;
                                    const quantity = quantityToAdd + currentQuantity;

                                    const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                    if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                        modalInteraction.reply({
                                            content: "Você tem que colocar um número positivo válido.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };
                                    if (atrPoints < 0) {
                                        modalInteraction.reply({
                                            content: "Você não tem pontos suficientes para esta ação.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };

                                    const newInfo = await characterProfile.findOneAndUpdate(
                                        {
                                            userID: user.id,
                                            "info.name": character,
                                        },
                                        {
                                            "stats.atrPoints": atrPoints,
                                            "stats.atrCON": quantity
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
                                        content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Constituição (CON)! Agora você possui ${newInfo.stats.atrCON} pontos neste atributo!`,
                                        ephemeral: true,
                                    });
                                    interaction.message.edit({
                                        content: "",
                                        files: [attachment],
                                    })
                                })
                                break;

                            case "editAtrFOR":
                                const FORModal = {
                                    title: "Editar Atributo - Força (FOR)",
                                    custom_id: "editFORModal",
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: "quantityFOR",
                                                    label: "Quantidade:",
                                                    placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                    min_length: 1,
                                                    max_length: 3,
                                                    style: 1,
                                                    required: true
                                                }
                                            ]
                                        }
                                    ]
                                };

                                await interaction.showModal(FORModal);

                                interaction.awaitModalSubmit({
                                    filter: (i) =>
                                        i.user.id === interaction.user.id &&
                                        i.customId === "editFORModal",
                                    time: 5 * 60_000,
                                }).then(async (modalInteraction) => {
                                    const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityFOR"));
                                    const currentQuantity = updatedcharacterInfo.stats.atrFOR;
                                    const quantity = quantityToAdd + currentQuantity;

                                    const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                    if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                        modalInteraction.reply({
                                            content: "Você tem que colocar um número positivo válido.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };
                                    if (atrPoints < 0) {
                                        modalInteraction.reply({
                                            content: "Você não tem pontos suficientes para esta ação.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };

                                    const newInfo = await characterProfile.findOneAndUpdate(
                                        {
                                            userID: user.id,
                                            "info.name": character,
                                        },
                                        {
                                            "stats.atrPoints": atrPoints,
                                            "stats.atrFOR": quantity
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
                                        content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Força (FOR)! Agora você possui ${newInfo.stats.atrFOR} pontos neste atributo!`,
                                        ephemeral: true,
                                    });
                                    interaction.message.edit({
                                        content: "",
                                        files: [attachment],
                                    });
                                });
                                break;

                            case "editAtrAGI":
                                const AGIModal = {
                                    title: "Editar Atributo - Agilidade (AGI)",
                                    custom_id: "editAGIModal",
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: "quantityAGI",
                                                    label: "Quantidade:",
                                                    placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                    min_length: 1,
                                                    max_length: 3,
                                                    style: 1,
                                                    required: true
                                                }
                                            ]
                                        }
                                    ]
                                };

                                await interaction.showModal(AGIModal);

                                interaction.awaitModalSubmit({
                                    filter: (i) =>
                                        i.user.id === interaction.user.id &&
                                        i.customId === "editAGIModal",
                                    time: 5 * 60_000,
                                }).then(async (modalInteraction) => {
                                    const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityAGI"));
                                    const currentQuantity = updatedcharacterInfo.stats.atrAGI;
                                    const quantity = quantityToAdd + currentQuantity;

                                    const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                    if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                        modalInteraction.reply({
                                            content: "Você tem que colocar um número positivo válido.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };
                                    if (atrPoints < 0) {
                                        modalInteraction.reply({
                                            content: "Você não tem pontos suficientes para esta ação.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };

                                    const newInfo = await characterProfile.findOneAndUpdate(
                                        {
                                            userID: user.id,
                                            "info.name": character,
                                        },
                                        {
                                            "stats.atrPoints": atrPoints,
                                            "stats.atrAGI": quantity
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
                                        content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Agilidade (AGI)! Agora você possui ${newInfo.stats.atrAGI} pontos neste atributo!`,
                                        ephemeral: true,
                                    });
                                    interaction.message.edit({
                                        content: "",
                                        files: [attachment],
                                    });
                                });
                                break;
                            case "editAtrINT":
                                const INTModal = {
                                    title: "Editar Atributo - Inteligência (INT)",
                                    custom_id: "editINTModal",
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: "quantityINT",
                                                    label: "Quantidade:",
                                                    placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                    min_length: 1,
                                                    max_length: 3,
                                                    style: 1,
                                                    required: true
                                                }
                                            ]
                                        }
                                    ]
                                };

                                await interaction.showModal(INTModal);

                                interaction.awaitModalSubmit({
                                    filter: (i) =>
                                        i.user.id === interaction.user.id &&
                                        i.customId === "editINTModal",
                                    time: 5 * 60_000,
                                }).then(async (modalInteraction) => {
                                    const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityINT"));
                                    const currentQuantity = updatedcharacterInfo.stats.atrINT;
                                    const quantity = quantityToAdd + currentQuantity;

                                    const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                    if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                        modalInteraction.reply({
                                            content: "Você tem que colocar um número positivo válido.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };
                                    if (atrPoints < 0) {
                                        modalInteraction.reply({
                                            content: "Você não tem pontos suficientes para esta ação.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };

                                    const newInfo = await characterProfile.findOneAndUpdate(
                                        {
                                            userID: user.id,
                                            "info.name": character,
                                        },
                                        {
                                            "stats.atrPoints": atrPoints,
                                            "stats.atrINT": quantity
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
                                        content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Inteligência (INT)! Agora você possui ${newInfo.stats.atrINT} pontos neste atributo!`,
                                        ephemeral: true,
                                    });
                                    interaction.message.edit({
                                        content: "",
                                        files: [attachment],
                                    });
                                });
                                break;
                            case "editAtrSAB":
                                const SABModal = {
                                    title: "Editar Atributo - Sabedoria (SAB)",
                                    custom_id: "editSABModal",
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: "quantitySAB",
                                                    label: "Quantidade:",
                                                    placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                    min_length: 1,
                                                    max_length: 3,
                                                    style: 1,
                                                    required: true
                                                }
                                            ]
                                        }
                                    ]
                                };

                                await interaction.showModal(SABModal);

                                interaction.awaitModalSubmit({
                                    filter: (i) =>
                                        i.user.id === interaction.user.id &&
                                        i.customId === "editSABModal",
                                    time: 5 * 60_000,
                                }).then(async (modalInteraction) => {
                                    const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantitySAB"));
                                    const currentQuantity = updatedcharacterInfo.stats.atrSAB;
                                    const quantity = quantityToAdd + currentQuantity;

                                    const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                    if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                        modalInteraction.reply({
                                            content: "Você tem que colocar um número positivo válido.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };
                                    if (atrPoints < 0) {
                                        modalInteraction.reply({
                                            content: "Você não tem pontos suficientes para esta ação.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };

                                    const newInfo = await characterProfile.findOneAndUpdate(
                                        {
                                            userID: user.id,
                                            "info.name": character,
                                        },
                                        {
                                            "stats.atrPoints": atrPoints,
                                            "stats.atrSAB": quantity
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
                                        content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Sabedoria (SAB)! Agora você possui ${newInfo.stats.atrSAB} pontos neste atributo!`,
                                        ephemeral: true,
                                    });
                                    interaction.message.edit({
                                        content: "",
                                        files: [attachment],
                                    });
                                });
                                break;
                            case "editAtrCAR":
                                const CARModal = {
                                    title: "Editar Atributo - Carisma (CAR)",
                                    custom_id: "editCARModal",
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: "quantityCAR",
                                                    label: "Quantidade:",
                                                    placeholder: "Digite aqui a quantidade de pontos que você quer adicionar a este atributo.",
                                                    min_length: 1,
                                                    max_length: 3,
                                                    style: 1,
                                                    required: true
                                                }
                                            ]
                                        }
                                    ]
                                };

                                await interaction.showModal(CARModal);

                                interaction.awaitModalSubmit({
                                    filter: (i) =>
                                        i.user.id === interaction.user.id &&
                                        i.customId === "editCARModal",
                                    time: 5 * 60_000,
                                }).then(async (modalInteraction) => {
                                    const quantityToAdd = Number(modalInteraction.fields.getTextInputValue("quantityCAR"));
                                    const currentQuantity = updatedcharacterInfo.stats.atrCAR;
                                    const quantity = quantityToAdd + currentQuantity;

                                    const atrPoints = updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                                    if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                                        modalInteraction.reply({
                                            content: "Você tem que colocar um número positivo válido.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };
                                    if (atrPoints < 0) {
                                        modalInteraction.reply({
                                            content: "Você não tem pontos suficientes para esta ação.",
                                            ephemeral: true,
                                        });
                                        return;
                                    };

                                    const newInfo = await characterProfile.findOneAndUpdate(
                                        {
                                            userID: user.id,
                                            "info.name": character,
                                        },
                                        {
                                            "stats.atrPoints": atrPoints,
                                            "stats.atrCAR": quantity
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
                                        content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo Carisma (CAR)! Agora você possui ${newInfo.stats.atrCAR} pontos neste atributo!`,
                                        ephemeral: true,
                                    });
                                    interaction.message.edit({
                                        content: "",
                                        files: [attachment],
                                    });
                                });
                                break;
                        }
                    })
                })
                break;
        };
    },
};