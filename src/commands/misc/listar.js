const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const characterProfile = require("../../models/characterProfile.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("listar")
        .setDescription("Lista os seus personagens."),
    run: async ({ interaction }) => {
        const user = interaction.user;

        const characterGroup = await characterProfile.find({
            userID: user.id,
        });

        if (characterGroup.length === 0) {
            interaction.reply("Você não tem personagens.");
            return;
        }

        // Divida os personagens em grupos de 10 (ou outra quantidade desejada por página)
        const itemsPerPage = 5;
        const pages = [];
        for (let i = 0; i < characterGroup.length; i += itemsPerPage) {
            const page = characterGroup.slice(i, i + itemsPerPage);
            pages.push(page);
        }

        // Função para criar um embed de página
        function createCharacterListEmbed(page, pageNum, totalPageNum) {
            const characterNames = page.map((data) => data.info.name);
            const embedMessage = new EmbedBuilder()
                .setTitle(`Personagens de ${user.username}`)
                .setDescription(characterNames.join("\n"))
                .setFooter({ text: `Página ${pageNum + 1} de ${totalPageNum}` })
            return embedMessage;
        }

        // Inicialize a primeira página
        let currentPage = 0;
        const totalPages = pages.length;
        const initialEmbed = createCharacterListEmbed(pages[currentPage], currentPage, totalPages);

        const previousButton = new ButtonBuilder()
            .setCustomId("prev_page")
            .setLabel("Página Anterior")
            .setStyle("Primary")
            .setDisabled(currentPage === 0);
        const nextButton = new ButtonBuilder()
            .setCustomId("next_page")
            .setLabel("Próxima Página")
            .setStyle("Primary")
            .setDisabled(currentPage === totalPages - 1);

        const row = new ActionRowBuilder().addComponents(previousButton, nextButton);

        const reply = await interaction.reply({ embeds: [initialEmbed], components: [row] });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                i.user.id === interaction.user.id && (i.customId === "prev_page" || i.customId === "next_page"),
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
            };

            // Atualize o estado dos botões com base na página atual
            previousButton.setDisabled(currentPage === 0); // Desabilitado se na primeira página
            nextButton.setDisabled(currentPage === totalPages - 1); // Desabilitado se na última página

            const newEmbed = createCharacterListEmbed(pages[currentPage], currentPage, totalPages);

            interaction.update({ embeds: [newEmbed], components: [row] });
        })
    },
};
