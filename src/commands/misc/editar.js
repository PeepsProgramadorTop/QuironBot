const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType
} = require("discord.js");
const characterProfile = require("../../models/characterProfile.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editar')
        .setDescription('Edita informações do seu personagem.')
        .addSubcommand(subcommand => subcommand
            .setName('nome')
            .setDescription('Edita o nome do seu personagem.')
            .addStringOption((option) => option
                .setName('novo_nome')
                .setDescription('O novo nome de exibição do seu personagem.')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('avatar')
            .setDescription('Edita o avatar do seu personagem.')
            .addStringOption((option) => option
                .setName('novo_avatar')
                .setDescription('Link da imagem do seu novo avatar.')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('banner')
            .setDescription('Edita o banner do seu personagem.')
            .addStringOption((option) => option
                .setName('novo_banner')
                .setDescription('Link da imagem do seu novo banner.')
                .setRequired(true)
            )
        ),
    run: async ({ interaction }) => {
        if (interaction.options.getSubcommand() === 'nome') {
            const newName = interaction.options.get('novo_nome').value;

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
                                .setDescription(`Mude o nome de ${characters.displayName}!`)
                                .setValue(characters.name)
                                .setEmoji('📝')
                        )
                    );
    
                const actionRow = new ActionRowBuilder().addComponents(charSelectMenu);
    
                const reply = await interaction.reply({
                    content: 'Selecione abaixo qual dos seus personagens você deseja alterar o nome.',
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
    
                    interaction.reply(`Nome novo: ${query.info.displayName}`)
                });
            };
        }
    }
};
