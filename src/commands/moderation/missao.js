const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");
const missaoSchema = require("../../models/missionSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("missao")
    .setDescription("Use todos os comandos relacionados à missões.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`criar`)
        .setDescription(`Comando de criação da missão.`)
        .addStringOption((option) =>
          option
            .setName("titulo")
            .setDescription("Nome da missão em questão.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("desc")
            .setDescription("Breve resumo da missão.")
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("imagem")
            .setDescription("Imagem que ilustre a missão.")
            .setRequired(false)
        )
        .addAttachmentOption((option) =>
          option
            .setName(`conta`)
            .setDescription(`Adicione a imagem da conta da missão.`)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cancela")
        .setDescription("cancela")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID da missão para cancelar")
            .setRequired(true)
        )
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("player")
        .setDescription(`Manipula os players presentes na missão.`)
        .addSubcommand((subcommand) =>
          subcommand
            .setName(`adicionar`)
            .setDescription(`Adiciona um personagem à mesa.`)
            .addStringOption((option) =>
              option
                .setName(`id do usuário.`)
                .setDescription(`Coloque o ID do jogador.`)
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName(`personagem`)
                .setDescription(`Coloque o nome do personagem do jogador.`)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName(`remove`)
            .setDescription(`Remove o jogador e seus personagens da missão.`)
            .addMentionableOption()
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`iniciar`)
        .setDescription(`Inicia a missão selecionada`)
        .addStringOption((option) =>
          option
            .setName(`ID da missão`)
            .setDescription(`Adicione o ID da missão`)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`finalizar`)
        .setDescription(`Finaliza a missão selecionada`)
        .addStringOption((option) =>
          option
            .setName(`ID da missão`)
            .setDescription(`Adicione o ID da missão`)
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "criar":
        const user = interaction.user;
        const guild = interaction.guild;
        const title = interaction.options.get("titulo").value;
        const description = interaction.options.get("desc").value;
        const imagem = interaction.options.getAttachment("imagem");
        const conta = interaction.options.getAttachment("Conta");
        const channel = client.channels.cache.get("1156525267934781470");

        const embed = new EmbedBuilder();
        embed.setAuthor({
          name: `${user.username}`,
          iconURL: `${user.displayAvatarURL({ size: 1024 })}`,
        });
        embed.setTitle(`${title}`);
        embed.setDescription(`${description}`);
        if (imagem != null) {
          embed.setImage(imagem.url);
        }

        await missaoSchema.findOneAndUpdate(
          {
            mestre: user.id,
          },
          {
            $set: {
              mestre: user.username,
              name: title,
              description: description,
              image: imagem,
              conta: cont,
              progress: false,
            },
          }
        );

        await channel.send({ embeds: [embed] });
        interaction.reply("Missão enviada com sucesso!");

      case "cancela":
    }
  },
};
