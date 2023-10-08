const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const missionSchema = require('../../models/missionSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('missao')
        .setDescription('Comandos relacionados à missões.')
        .addSubcommand((subcommand) => subcommand
            .setName('criar')
            .setDescription('Cria uma missão.')
            .addStringOption((option) => option
                .setName('titulo')
                .setDescription('Nome da missão em questão.')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('desc')
                .setDescription('Breve resumo da missão.')
                .setRequired(true)
            )
            .addAttachmentOption((option) => option
                .setName('conta')
                .setDescription('Imagem da conta que os personagens ganharão quando essa missão acabar.')
                .setRequired(true)
            )
            .addAttachmentOption((option) => option
                .setName('imagem')
                .setDescription('Imagem que ilustre a missão.')
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('cancelar')
            .setDescription('Cancela a missão inserida.')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('ID da missão para cancelar')
                .setRequired(true)
            )
        )
        .addSubcommandGroup((subcommandGroup) => subcommandGroup
            .setName('player')
            .setDescription('Manipula os players presentes na missão.')
            .addSubcommand((subcommand) => subcommand
                .setName('adicionar')
                .setDescription('Adiciona um personagem à mesa.')
                .addUserOption((option) => option
                    .setName('jogador')
                    .setDescription('Selecione o jogador.')
                    .setRequired(true)
                )
                .addStringOption((option) => option
                    .setName('personagem')
                    .setDescription('Coloque o nome do personagem do jogador.')
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName('remover')
                .setDescription('Remove o jogador e seus personagens da missão.')
                .addUserOption((option) => option
                    .setName('jogador')
                    .setDescription('Selecione o jogador que você quer remover.')
                    .setRequired(true)
                )
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('iniciar')
            .setDescription('Inicia a missão selecionada')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('Adicione o ID da missão')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('finalizar')
            .setDescription('Finaliza a missão selecionada')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('Adicione o ID da missão')
                .setRequired(true)
            )
        ),
    run: async ({ client, interaction }) => {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'criar':
                const user = interaction.user;
                const guild = interaction.guild;
                const title = interaction.options.get('titulo').value;
                const description = interaction.options.get('desc').value;
                const image = interaction.options.getAttachment('imagem');
                const bead = interaction.options.getAttachment('conta');
                const channel = client.channels.cache.get('1156525267934781470');
                const missionID = `${title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]+/g, "").replaceAll(" ", ".")}_${user.id}`

                const check = await missionSchema.findOne({ missionID: missionID, masterID: user.id, });
                if (check != null && check.missionID == missionID) {
                    interaction.reply('Essa missão já foi criada por você.');
                    return;
                };

                await missionSchema.findOneAndUpdate(
                    {
                        missionID: missionID,
                        masterID: user.id,
                    },
                    {
                        $set: {
                            //missionID = modified.mission.name_masterID
                            missionID: missionID,
                            masterID: user.id,
                            title: title,
                            description: description,
                            image: image ? image.url : null,
                            bead: bead.url,
                            progress: false,
                        },
                    },
                    {
                        upsert: true,
                    }
                );

                const data = await missionSchema.findOne({
                    missionID: missionID,
                    masterID: user.id,
                });

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${user.username}`,
                        iconURL: `${user.displayAvatarURL({ size: 1024 })}`,
                    })
                    .setTitle(`${title}`)
                    .setDescription(`${description}`)
                    .setImage(image ? image.url : null);

                await channel.send({ embeds: [embed] });

                interaction.reply(`Missão enviada com sucesso em <#${channel.id}>! O ID da missão é: \`${data.missionID}\``);

                break;
            case 'cancelar':
                break;
        }
    },
};