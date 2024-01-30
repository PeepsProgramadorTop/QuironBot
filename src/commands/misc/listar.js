const {
    ComponentType, AttachmentBuilder
} = require("discord.js");
const characterProfile = require("../../models/characterProfile.js");
const { createCard } = require("../../utils/createCard");

module.exports = {
    data: {
        name: "listar",
        description: "Exibe os personagens do usuário e suas informações.",
        options: [
            {
                type: 6,
                name: "usuário",
                description: "O usuário que você quer que o bot liste os personagens pertencentes.",
                required: false
            }
        ]
    },
    run: async ({ interaction }) => {
        const user = interaction.options.getUser('usuário') ? interaction.options.getUser('usuário') : interaction.user;

        const characterGroup = await characterProfile.find({
            userID: user.id,
        });

        if (characterGroup.length === 0) {
            if (user == interaction.user) {
                interaction.reply("Você não tem personagens.")
            } else {
                interaction.reply("Este usuário não tem personagens.")
            }
            return;
        }

        function createCharacterListEmbed(characterData, pageNum, totalPageNum) {
            const embedMessage = [
                {
                    color: 0x5865F2,
                    title: `Você está visualizando ${characterData.info.name}... (${pageNum + 1}/${totalPageNum})`,
                    author: {
                        name: `Personagens de: ${user.username}`,
                        icon_url: user.displayAvatarURL()
                    },
                    image: {
                        url: "https://i.imgur.com/rg4KxSi.png"
                    }
                },
                {
                    color: 0x5865F2,
                    title: characterData.info.name,
                    description: `**${characterData.info.nicknames}**\n\n**Chalé:** \`${characterData.info.cabin}\`\n**Prefixo:** \`${characterData.info.prefix}\``,
                    image: {
                        url: characterData.info.banner
                    },
                    thumbnail: {
                        url: characterData.info.avatar
                    },
                    footer: {
                        text: `Personagem ${pageNum + 1} de ${totalPageNum}`
                    }
                }
            ];
            return embedMessage;
        }

        let currentPage = 0;
        const totalPages = characterGroup.length;
        const initialEmbed = createCharacterListEmbed(characterGroup[currentPage], currentPage, totalPages);

        const actionRow = {
            type: 1, //Action Row
            components: [
                {
                    type: 2, //Botão - Primeira Página
                    custom_id: "first_page",
                    emoji: "<:regress_arrow:1172966559405314211>",
                    style: 1,
                    disabled: currentPage === 0
                },
                {
                    type: 2, //Botão - Página Anterior
                    custom_id: "prev_page",
                    emoji: "<:left_arrow:1172966183021068288>",
                    style: 1,
                    disabled: currentPage === 0
                },
                {
                    type: 2, //Botão - Checar Status
                    custom_id: "check_status",
                    label: "Checar Status",
                    style: 1
                },
                {
                    type: 2, //Botão - Próxima Página
                    custom_id: "next_page",
                    emoji: "<:right_arrow:1172965932986015815>",
                    style: 1,
                    disabled: currentPage === totalPages - 1
                },
                {
                    type: 2, //Botão - Última Página
                    custom_id: "last_page",
                    emoji: "<:advance_arrow:1172966708949033072>",
                    style: 1,
                    disabled: currentPage === totalPages - 1
                }
            ]
        };

        const reply = await interaction.reply({ embeds: initialEmbed, components: [actionRow] });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                i.user.id === interaction.user.id,
        });
        collector.on("collect", async (interaction) => {
            switch (interaction.customId) {
                case "prev_page":
                    if (currentPage > 0) {
                        currentPage--;
                    }
                    break;
                case "next_page":
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                    }
                    break;
                case "first_page":
                    currentPage = 0;
                    break;
                case "last_page":
                    currentPage = totalPages - 1;
                    break;
            };

            // Atualize o estado dos botões com base na página atual
            actionRow.components[0].disabled = currentPage === 0; // Desabilitado se na primeira página
            actionRow.components[1].disabled = currentPage === 0; // Desabilitado se na primeira página
            actionRow.components[3].disabled = currentPage === totalPages - 1; // Desabilitado se na última página
            actionRow.components[4].disabled = currentPage === totalPages - 1; // Desabilitado se na última página

            const newEmbed = createCharacterListEmbed(characterGroup[currentPage], currentPage, totalPages);

            interaction.update({ embeds: newEmbed, components: [actionRow] });
            if (interaction.customId == "check_status") {
                const banner = await createCard(characterGroup[currentPage], user);
                const attachment = new AttachmentBuilder(banner, {
                    name: `banner.png`,
                });

                await interaction.followUp({ files: [attachment], ephemeral: true });
            }
        })
    },
};
