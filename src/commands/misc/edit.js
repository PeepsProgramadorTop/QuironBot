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
    .addSubcommand((subcommand) =>
      subcommand
        .setName("nome")
        .setDescription("Edita o nome do seu personagem.")
        .addStringOption((option) =>
          option
            .setName("novo_nome")
            .setDescription("O novo nome de exibição do seu personagem.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("personagem")
            .setDescription("Coloque o nome do personagem que deseja alterar")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("avatar")
        .setDescription("Edita o avatar do seu personagem.")
        .addStringOption((option) =>
          option
            .setName("novo_avatar")
            .setDescription("Link da imagem do seu novo avatar.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("personagem")
            .setDescription("Coloque o nome do personagem que deseja alterar")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("banner")
        .setDescription("Edita o banner do seu personagem.")
        .addStringOption((option) =>
          option
            .setName("novo_banner")
            .setDescription("Link da imagem do seu novo banner.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("personagem")
            .setDescription("Coloque o nome do personagem que deseja alterar")
            .setRequired(true),
        ),
    ),
  run: async ({ interaction }) => {
    if (interaction.options.getSubcommand() === "nome") {
      const user = interaction.user;

      const characterGroup = await characterProfile.find({ userID: user.id });

      switch (subcommand) {
        case "nome":
          const newName = interaction.options.get("novo_nome").value;
          const name = interaction.options.get("personagem").value;

          await characterGroup.findAndUpdate(
            { "info.name": name },
            { $set: { "info.name": newName } },
          );

          break;

        case "avatar":
          break;
        case "banner":
          break;
      }
    }
  },
};
