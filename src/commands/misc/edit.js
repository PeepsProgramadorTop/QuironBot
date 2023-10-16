const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("editar")
        .setDescription("Edita informações do seu personagem.")
        .addSubcommand((subcommand) => subcommand
            .setName("nome")
            .setDescription("Edita o nome de exibição do personagem selecionado.")
            .addStringOption((option) => option
                .setName("nome")
                .setDescription("O novo nome de exibição do seu personagem.")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName("avatar")
            .setDescription("Edita o avatar do seu personagem.")
            .addAttachmentOption((option) => option
                .setName("avatar")
                .setDescription("Anexo da imagem do seu novo avatar.")
            )
            .addStringOption((option) => option
                .setName("avatar-url")
                .setDescription("Link da imagem do seu novo avatar.")
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName("banner")
            .setDescription("Edita o banner do seu personagem.")
            .addAttachmentOption((option) => option
                .setName("banner")
                .setDescription("Anexo da imagem do seu novo banner.")
            )
            .addStringOption((option) => option
                .setName("banner-url")
                .setDescription("Link da imagem do seu novo banner.")
            )
        ),
    run: async ({ interaction }) => {
        if (interaction.options.getSubcommand() === 'nome') {
            const newName = interaction.options.get('nome').value;
            const user = interaction.user;

            const characterGroup = await characterProfile.find({ userID: user.id });

            const names = [];
            characterGroup.forEach((data) => {
                names.push({ name: `${data.info.name}`, displayName: `${data.info.displayName}` });
            });

            if (names.length == 1) {
                const query = await characterProfile.findOneAndUpdate(
                    {
                        userID: user.id,
                        "info.name": names[0].name
                    },
                    {
                        "info.displayName": newName
                    },
                    {
                        returnOriginal: false
                    }
                );
                interaction.reply(`Nome novo: ${query.info.displayName}`);
            } else if (names.length > 1) {
                const charSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId(interaction.id)
                    .setPlaceholder("Selecione aqui.")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .addOptions(
                        names.map((characters) =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(characters.displayName)
                                .setDescription(`Mude o nome de ${characters.displayName} para ${newName}!`)
                                .setValue(characters.name)
                                .setEmoji('📝')
                        )
                    );

                const actionRow = new ActionRowBuilder().addComponents(charSelectMenu);

                const reply = await interaction.reply({
                    content: `Selecione abaixo qual dos seus personagens você deseja alterar o nome para ${newName}.`,
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

                    const query = await characterProfile.findOneAndUpdate(
                        {
                            userID: user.id,
                            "info.name": character
                        },
                        {
                            "info.displayName": newName
                        },
                        {
                            returnOriginal: false
                        }
                    );

                    reply.edit({
                        content: `Nome novo: ${query.info.displayName}`,
                        components: []
                    })
                });
            };
        }
    },
};
