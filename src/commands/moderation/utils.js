const { SlashCommandBuilder, ComponentType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("personagem")
    .setDescription("Altera algumas informações do personagem.")
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("xp")
        .setDescription("Manipula o xp do personagem")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Adiciona xp para o personagem")
            .addUserOption((option) =>
              option
                .setName("jogador")
                .setDescription("Selecione o jogador.")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName("quantidade")
                .setDescription("Quantidade para adicionar ao personagem")
                .setRequired(true),
            )
        )
        .addSubcommand((subcommand) =>
              subcommand
                .setName("remove")
                .setDescription("Adiciona xp para o personagem")
                .addUserOption((option) =>
                  option
                    .setName("jogador")
                    .setDescription("Selecione o jogador.")
                    .setRequired(true),
                )
                .addStringOption((option) =>
                  option
                    .setName("quantidade")
                    .setDescription("Quantidade para adicionar ao personagem")
                    .setRequired(true),
                ),
            ),
    ),
  run: async ({ client, interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    const characterDB = require("../../models/characterProfile");
    const target = interaction.options.get("jogador").value;
    const quantity = interaction.options.get("quantidade").value;
    const characterGroup = await characterDB.find({
      userID: target.id,
    });

    async function getCharacters(ID) {
      const userCharacters = await characterGroup.map((data) => ({
        name: data.info.name,
        cabin: data.info.cabin,
      }));

      return userCharacters;
    }

    async function selectCharacter(array) {
      switch (userCharacters.length) {
        case 0:
          return interaction.editReply(
            "Este usuário não possui personagens registrados",
          );

        case 1:
          return userCharacters[0].name;

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
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "selectCharacterMenu",
                placeholder: "Selecione aqui...",
                min_values: 0,
                max_values: 1,
                options: array.map((characters) => {
                  const emoji = emojiMap[characters.cabin] || "❓";
                  return {
                    label: characters.name,
                    value: characters.name,
                    description: `Selecione ${characters.name} para alterações.`,
                    emoji: emoji,
                  };
                }),
              },
            ],
          };

          await interaction.editReply({
            content: "Selecione o personagem para alterar abaixo:",
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
            await interaction.deferUpdate();
            return interaction.values[0];
          });
      }
    }

    async function add(name) {
      const character = await characterGroup.findOneAndUpdate(
        { "info.name": name },
        { $sum: { "info.xp": quantity } },
      );
      await interaction.editReply(
        `O XP de ${name} foi alterado para ${character.info.xp}`,
      );
    }
    async function subtract(name) {
      const character = await characterGroup.findOneAndUpdate(
        { "info.name": name },
        { $sub: { "info.xp": quantity } },
      );

      await interaction.editReply(
        `O XP de ${name} foi alterado para ${character.info.xp}`,
      );
    }

    switch (subcommand) {
      case "add":
        interaction.deferReply();
        add(selectCharacter(getCharacters(target)));

        break;

      case "remove":
        subtract(selectCharacter(getCharacters(target)));
    }
  },
};
