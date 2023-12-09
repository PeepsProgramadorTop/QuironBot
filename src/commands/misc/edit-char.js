const { IntentsBitField } = require("discord.js");
const { SlashCommandBuilder, ComponentType } = require("discord.js");
const characterProfile = require("../../models/characterProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("editar-personagem")
        .setDescription("Edita o personagem do usuário marcado.")
        .addUserOption((option) =>
            option
                .setName("usuario")
                .setDescription("Usuário que você quer editar o personagem.")
                .setRequired(true),
        )
        .setDefaultMemberPermissions(IntentsBitField.Flags.GuildModeration),
    run: async ({ interaction }) => {
        await interaction.deferReply();

        const { user } = interaction;
        const userMentioned = interaction.options.getUser('usuario');

        const characterGroup = await characterProfile.find({ userID: userMentioned.id });
        const names = characterGroup.map((data) => ({
            name: data.info.name
        }));

        switch (names.lenght) {
            case 1:
                break;
            default:
                const actionRowAvatar = {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 3, // String Select Menu
                            custom_id: interaction.id,
                            placeholder: "Selecione aqui.",
                            min_values: 0,
                            max_values: 1,
                            options: names.map((characters) => ({
                                label: characters.name,
                                description: `Edite o personagem ${characters.name}!`,
                                value: characters.name,
                                emoji: "📝",
                            })),
                        },
                    ],
                };

                const reply = await interaction.editReply({
                    content: `Selecione abaixo qual dos personagens do usuário escolhido você quer editar.`,
                    components: [actionRowAvatar],
                });

                const collector = reply.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    filter: (i) =>
                        i.user.id === interaction.user.id &&
                        i.customId === interaction.id,
                    time: 15 * 60_000,
                });
                collector.on("collect", async (interaction) => {
                    const character = interaction.values[0];

                    const characterInfo = await characterProfile.findOne({
                        userID: userMentioned.id,
                        "info.name": character,
                    });

                    const embed = [
                        {
                            color: 0x575A63,
                            author: {
                                name: `Personagem de: ${userMentioned.username}`,
                                icon_url: userMentioned.displayAvatarURL()
                            },
                            title: `Você está editando: ${characterInfo.info.name}`,
                            image: {
                                url: "https://i.imgur.com/rg4KxSi.png"
                            }
                        },
                        {
                            color: 0x575A63,
                            title: characterInfo.info.name,
                            description: `**${characterInfo.info.nicknames}**\n\n**Chalé:** \`${characterInfo.info.cabin}\`\n**Prefixo:** \`${characterInfo.info.prefix}\`\n\n> **❤️・Vida:** \`${characterInfo.info.hitPoints.current}/${characterInfo.info.hitPoints.base}HP\`\n> **🪙・Dinheiro:** \`${characterInfo.info.money}\`\n> **📊・Nível:** \`${characterInfo.info.xp}\`\n\n>>> **🌟・Ponto(s) Restante(s):** \`${characterInfo.stats.atrPoints}\`\n\n**🫀・Constituição (CON):** \`${characterInfo.stats.atrCON}\`\n**🗡️・Força (FOR):** \`${characterInfo.stats.atrFOR}\`\n**🦿・Agilidade (AGI):** \`${characterInfo.stats.atrAGI}\`\n**📜・Inteligência (INT):** \`${characterInfo.stats.atrINT}\`\n**🦉・Sabedoria (SAB):** \`${characterInfo.stats.atrSAB}\`\n**✨・Carisma (CAR):** \`${characterInfo.stats.atrCAR}\``,
                            image: {
                                url: characterInfo.info.banner
                            },
                            thumbnail: {
                                url: characterInfo.info.avatar
                            }
                        }
                    ];

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
                                        label: "Pontos de Atributos",
                                        description: "Altere os pontos de atributos disponíveis deste personagem.",
                                        value: "editAtrPoints",
                                        emoji: "🌟",
                                    },
                                    {
                                        label: "Contituição (CON)",
                                        description: "Altere os valores da Constituição deste personagem.",
                                        value: "editAtrCON",
                                        emoji: "🫀",
                                    },
                                    {
                                        label: "Força (FOR)",
                                        description: "Altere os valores da Força deste personagem.",
                                        value: "editAtrFOR",
                                        emoji: "🗡️",
                                    },
                                    {
                                        label: "Agilidade (AGI)",
                                        description: "Altere os valores da Agilidade deste personagem.",
                                        value: "editAtrAGI",
                                        emoji: "🦿",
                                    },
                                    {
                                        label: "Inteligência (INT)",
                                        description: "Altere os valores da Inteligência deste personagem.",
                                        value: "editAtrINT",
                                        emoji: "📜",
                                    },
                                    {
                                        label: "Sabedoria (SAB)",
                                        description: "Altere os valores da Sabedoria deste personagem.",
                                        value: "editAtrSAB",
                                        emoji: "🦉",
                                    },
                                    {
                                        label: "Carisma (CAR)",
                                        description: "Altere os valores da Carisma deste personagem.",
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
                                type: 2, //Botão - Alterar Avatar e Banner
                                disabled: true,
                                custom_id: "editImagesButton",
                                label: "Avatar e Banner só são editáveis pelos próprios jogadores.",
                                emoji: "🖼️",
                                style: 2 // Secondary
                            },
                        ],
                    };
                    const thirdActionRow = {
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
                                type: 2, //Botão - Alterar as Informações
                                custom_id: "editStatusButton",
                                label: "Alterar Status",
                                emoji: "📊",
                                style: 2 // Secondary
                            },
                            {
                                type: 2, //Botão - Alterar as Informações
                                custom_id: "deleteButton",
                                emoji: "🗑️",
                                style: 4 // Danger
                            }
                        ],
                    };

                    await interaction.deferUpdate();
                    const reply = await interaction.message.edit({
                        content: '',
                        components: [firstActionRow, secondActionRow, thirdActionRow],
                        embeds: embed
                    });

                    const collectorEditInfo = reply.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        filter: (i) =>
                            i.user.id === interaction.user.id && i.customId === "editInfoButton",
                    });
                    collectorEditInfo.on("collect", async (interaction) => {
                        //Informações do Personagem Atualizadas
                        const updatedcharacterInfo = await characterProfile.findOne({
                            userID: userMentioned.id,
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
                                            placeholder: "Digite o novo prefixo para este personagem aqui.",
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
                                            placeholder: "Digite o novo nome para este personagem aqui.",
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
                                            placeholder: "Digite os novos apelidos para este personagem aqui.",
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
                                    userID: userMentioned.id,
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

                            const embed = [
                                {
                                    color: 0x575A63,
                                    author: {
                                        name: `Personagem de: ${userMentioned.username}`,
                                        icon_url: userMentioned.displayAvatarURL()
                                    },
                                    title: `Você está editando: ${newInfo.info.name}`,
                                    image: {
                                        url: "https://i.imgur.com/rg4KxSi.png"
                                    }
                                },
                                {
                                    color: 0x575A63,
                                    title: newInfo.info.name,
                                    description: `**${newInfo.info.nicknames}**\n\n**Chalé:** \`${newInfo.info.cabin}\`\n**Prefixo:** \`${newInfo.info.prefix}\`\n\n> **❤️・Vida:** \`${newInfo.info.hitPoints.current}/${newInfo.info.hitPoints.base}HP\`\n> **🪙・Dinheiro:** \`${newInfo.info.money}\`\n> **📊・Nível:** \`${newInfo.info.xp}\`\n\n>>> **🌟・Ponto(s) Restante(s):** \`${newInfo.stats.atrPoints}\`\n\n**🫀・Constituição (CON):** \`${newInfo.stats.atrCON}\`\n**🗡️・Força (FOR):** \`${newInfo.stats.atrFOR}\`\n**🦿・Agilidade (AGI):** \`${newInfo.stats.atrAGI}\`\n**📜・Inteligência (INT):** \`${newInfo.stats.atrINT}\`\n**🦉・Sabedoria (SAB):** \`${newInfo.stats.atrSAB}\`\n**✨・Carisma (CAR):** \`${newInfo.stats.atrCAR}\``,
                                    image: {
                                        url: newInfo.info.banner
                                    },
                                    thumbnail: {
                                        url: newInfo.info.avatar
                                    }
                                }
                            ];

                            modalInteraction.reply({
                                content: "Informações alteradas com sucesso!",
                                ephemeral: true,
                            });

                            interaction.message.edit({
                                embeds: embed
                            })
                        })
                    });


                    const collectorStatusInfo = reply.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        filter: (i) =>
                            i.user.id === interaction.user.id && i.customId === "editStatusButton",
                    });
                    collectorStatusInfo.on("collect", async (interaction) => {
                        //Informações do Personagem Atualizadas
                        const updatedcharacterInfo = await characterProfile.findOne({
                            userID: userMentioned.id,
                            "info.name": character,
                        });

                        //Construindo o Modal
                        const modal = {
                            title: "Editar Status do Personagem",
                            custom_id: "editCharStatusModal",
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 4,
                                            custom_id: "maxHPInput",
                                            label: "HP Máximo:",
                                            placeholder: "Digite o novo valor de HP máximo para este personagem.",
                                            value: updatedcharacterInfo.info.hitPoints.base,
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
                                            custom_id: "currentHPInput",
                                            label: "HP Atual:",
                                            placeholder: "Digite o novo valor de HP atual para este personagem.",
                                            value: updatedcharacterInfo.info.hitPoints.current,
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
                                            custom_id: "moneyInput",
                                            label: "Dinheiro:",
                                            placeholder: "Digite o novo valor monetário que este personagem terá.",
                                            value: updatedcharacterInfo.info.money,
                                            min_length: 1,
                                            max_length: 4000,
                                            style: 2,
                                            required: true
                                        }
                                    ]
                                },
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 4,
                                            custom_id: "xpInput",
                                            label: "Nível:",
                                            placeholder: "Digite o novo nível para este personagem.",
                                            value: updatedcharacterInfo.info.xp,
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
                                i.customId === "editCharStatusModal",
                            time: 5 * 60_000,
                        }).then(async (modalInteraction) => {
                            const newMaxHP = modalInteraction.fields.getTextInputValue("maxHPInput");
                            const newCurrentHP = modalInteraction.fields.getTextInputValue("currentHPInput");
                            const newMoneyValue = modalInteraction.fields.getTextInputValue("moneyInput");
                            const newXPValue = modalInteraction.fields.getTextInputValue("xpInput");

                            const newInfo = await characterProfile.findOneAndUpdate(
                                {
                                    userID: userMentioned.id,
                                    "info.name": character,
                                },
                                {
                                    "info.hitPoints.base": newMaxHP,
                                    "info.hitPoints.current": newCurrentHP,
                                    "info.money": newMoneyValue,
                                    "info.xp": newXPValue,
                                },
                                {
                                    returnOriginal: false,
                                }
                            );

                            const embed = [
                                {
                                    color: 0x575A63,
                                    author: {
                                        name: `Personagem de: ${userMentioned.username}`,
                                        icon_url: userMentioned.displayAvatarURL()
                                    },
                                    title: `Você está editando: ${newInfo.info.name}`,
                                    image: {
                                        url: "https://i.imgur.com/rg4KxSi.png"
                                    }
                                },
                                {
                                    color: 0x575A63,
                                    title: newInfo.info.name,
                                    description: `**${newInfo.info.nicknames}**\n\n**Chalé:** \`${newInfo.info.cabin}\`\n**Prefixo:** \`${newInfo.info.prefix}\`\n\n> **❤️・Vida:** \`${newInfo.info.hitPoints.current}/${newInfo.info.hitPoints.base}HP\`\n> **🪙・Dinheiro:** \`${newInfo.info.money}\`\n> **📊・Nível:** \`${newInfo.info.xp}\`\n\n>>> **🌟・Ponto(s) Restante(s):** \`${newInfo.stats.atrPoints}\`\n\n**🫀・Constituição (CON):** \`${newInfo.stats.atrCON}\`\n**🗡️・Força (FOR):** \`${newInfo.stats.atrFOR}\`\n**🦿・Agilidade (AGI):** \`${newInfo.stats.atrAGI}\`\n**📜・Inteligência (INT):** \`${newInfo.stats.atrINT}\`\n**🦉・Sabedoria (SAB):** \`${newInfo.stats.atrSAB}\`\n**✨・Carisma (CAR):** \`${newInfo.stats.atrCAR}\``,
                                    image: {
                                        url: newInfo.info.banner
                                    },
                                    thumbnail: {
                                        url: newInfo.info.avatar
                                    }
                                }
                            ];

                            modalInteraction.reply({
                                content: "Informações alteradas com sucesso!",
                                ephemeral: true,
                            });

                            interaction.message.edit({
                                embeds: embed
                            })
                        })
                    })
                    const collectorAtr = reply.createMessageComponentCollector({
                        componentType: ComponentType.StringSelect,
                        filter: (i) =>
                            i.user.id === interaction.user.id &&
                            i.customId === "atrSelectMenu",
                        time: 15 * 60_000,
                    });
                    collectorAtr.on("collect", async (interaction) => {
                        async function handleEditAtributo(atributo, sigla, propriedade) {
                            const modalData = {
                                title: `Editar Atributo - ${atributo} (${sigla})`,
                                custom_id: `edit${sigla}Modal`,
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                custom_id: `quantity${sigla}`,
                                                label: "Quantidade:",
                                                placeholder: `Digite aqui a quantidade de pontos que você quer setar neste atributo.`,
                                                min_length: 1,
                                                max_length: 3,
                                                style: 1,
                                                required: true
                                            }
                                        ]
                                    }
                                ]
                            };

                            await interaction.showModal(modalData);

                            interaction.awaitModalSubmit({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId === `edit${sigla}Modal`,
                                time: 5 * 60_000,
                            }).then(async (modalInteraction) => {
                                const quantity = Number(modalInteraction.fields.getTextInputValue(`quantity${sigla}`));

                                const newInfo = await characterProfile.findOneAndUpdate(
                                    {
                                        userID: userMentioned.id,
                                        "info.name": character,
                                    },
                                    {
                                        [`stats.${propriedade}`]: quantity
                                    },
                                    {
                                        returnOriginal: false,
                                    }
                                );

                                const embed = [
                                    {
                                        color: 0x575A63,
                                        author: {
                                            name: `Personagem de: ${userMentioned.username}`,
                                            icon_url: userMentioned.displayAvatarURL()
                                        },
                                        title: `Você está editando: ${newInfo.info.name}`,
                                        image: {
                                            url: "https://i.imgur.com/rg4KxSi.png"
                                        }
                                    },
                                    {
                                        color: 0x575A63,
                                        title: newInfo.info.name,
                                        description: `**${newInfo.info.nicknames}**\n\n**Chalé:** \`${newInfo.info.cabin}\`\n**Prefixo:** \`${newInfo.info.prefix}\`\n\n> **❤️・Vida:** \`${newInfo.info.hitPoints.current}/${newInfo.info.hitPoints.base}HP\`\n> **🪙・Dinheiro:** \`${newInfo.info.money}\`\n> **📊・Nível:** \`${newInfo.info.xp}\`\n\n>>> **🌟・Ponto(s) Restante(s):** \`${newInfo.stats.atrPoints}\`\n\n**🫀・Constituição (CON):** \`${newInfo.stats.atrCON}\`\n**🗡️・Força (FOR):** \`${newInfo.stats.atrFOR}\`\n**🦿・Agilidade (AGI):** \`${newInfo.stats.atrAGI}\`\n**📜・Inteligência (INT):** \`${newInfo.stats.atrINT}\`\n**🦉・Sabedoria (SAB):** \`${newInfo.stats.atrSAB}\`\n**✨・Carisma (CAR):** \`${newInfo.stats.atrCAR}\``,
                                        image: {
                                            url: newInfo.info.banner
                                        },
                                        thumbnail: {
                                            url: newInfo.info.avatar
                                        }
                                    }
                                ];

                                modalInteraction.reply({
                                    content: "Informações alteradas com sucesso!",
                                    ephemeral: true,
                                });
                                interaction.message.edit({
                                    embeds: embed
                                })
                            });
                        };

                        switch (interaction.values[0]) {
                            case "editAtrPoints":

                                const modalData = {
                                    title: `Editar Pontos de Atributo`,
                                    custom_id: `editAtrPointsModal`,
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: `quantityAtrPoints`,
                                                    label: "Quantidade:",
                                                    placeholder: `Digite aqui a quantidade de pontos que você quer setar neste atributo.`,
                                                    min_length: 1,
                                                    max_length: 3,
                                                    style: 1,
                                                    required: true
                                                }
                                            ]
                                        }
                                    ]
                                };

                                await interaction.showModal(modalData);

                                interaction.awaitModalSubmit({
                                    filter: (i) =>
                                        i.user.id === interaction.user.id &&
                                        i.customId === "editAtrPointsModal",
                                    time: 15 * 60_000,
                                }).then(async (modalInteraction) => {
                                    const quantity = Number(modalInteraction.fields.getTextInputValue("quantityAtrPoints"));

                                    const newInfo = await characterProfile.findOneAndUpdate(
                                        {
                                            userID: userMentioned.id,
                                            "info.name": character,
                                        },
                                        {
                                            "stats.atrPoints": quantity
                                        },
                                        {
                                            returnOriginal: false,
                                        }
                                    );

                                    const embed = [
                                        {
                                            color: 0x575A63,
                                            author: {
                                                name: `Personagem de: ${userMentioned.username}`,
                                                icon_url: userMentioned.displayAvatarURL()
                                            },
                                            title: `Você está editando: ${newInfo.info.name}`,
                                            image: {
                                                url: "https://i.imgur.com/rg4KxSi.png"
                                            }
                                        },
                                        {
                                            color: 0x575A63,
                                            title: newInfo.info.name,
                                            description: `**${newInfo.info.nicknames}**\n\n**Chalé:** \`${newInfo.info.cabin}\`\n**Prefixo:** \`${newInfo.info.prefix}\`\n\n> **❤️・Vida:** \`${newInfo.info.hitPoints.current}/${newInfo.info.hitPoints.base}HP\`\n> **🪙・Dinheiro:** \`${newInfo.info.money}\`\n> **📊・Nível:** \`${newInfo.info.xp}\`\n\n>>> **🌟・Ponto(s) Restante(s):** \`${newInfo.stats.atrPoints}\`\n\n**🫀・Constituição (CON):** \`${newInfo.stats.atrCON}\`\n**🗡️・Força (FOR):** \`${newInfo.stats.atrFOR}\`\n**🦿・Agilidade (AGI):** \`${newInfo.stats.atrAGI}\`\n**📜・Inteligência (INT):** \`${newInfo.stats.atrINT}\`\n**🦉・Sabedoria (SAB):** \`${newInfo.stats.atrSAB}\`\n**✨・Carisma (CAR):** \`${newInfo.stats.atrCAR}\``,
                                            image: {
                                                url: newInfo.info.banner
                                            },
                                            thumbnail: {
                                                url: newInfo.info.avatar
                                            }
                                        }
                                    ];

                                    modalInteraction.reply({
                                        content: "Informações alteradas com sucesso!",
                                        ephemeral: true,
                                    });
                                    interaction.message.edit({
                                        embeds: embed
                                    })
                                });
                                break;
                            case "editAtrCON":
                                handleEditAtributo("Constituição", "CON", "atrCON");
                                break;
                            case "editAtrFOR":
                                handleEditAtributo("Força", "FOR", "atrFOR");
                                break;
                            case "editAtrAGI":
                                handleEditAtributo("Agilidade", "AGI", "atrAGI");
                                break;
                            case "editAtrINT":
                                handleEditAtributo("Inteligência", "INT", "atrINT");
                                break;
                            case "editAtrSAB":
                                handleEditAtributo("Sabedoria", "SAB", "atrSAB");
                                break;
                            case "editAtrCAR":
                                handleEditAtributo("Carisma", "CAR", "atrCAR");
                                break;
                        }
                    })
                });
                break;
        }
    },
};