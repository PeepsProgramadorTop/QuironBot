const {
  SlashCommandBuilder,
  ComponentType,
  AttachmentBuilder,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editar")
    .setDescription("Edita informações do seu personagem.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("nome")
        .setDescription("Edita o nome de exibição do personagem selecionado.")
        .addStringOption((option) =>
          option
            .setName("nome")
            .setDescription("O novo nome de exibição do seu personagem.")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("apelidos")
        .setDescription("Edita os apelidos do personagem selecionado.")
        .addStringOption((option) =>
          option
            .setName("apelidos")
            .setDescription("Os novos apelidos do seu personagem.")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("avatar")
        .setDescription("Edita o avatar do seu personagem.")
        .addAttachmentOption((option) =>
          option
            .setName("avatar")
            .setDescription("Anexo da imagem do seu novo avatar.")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("banner")
        .setDescription("Edita o banner do seu personagem.")
        .addAttachmentOption((option) =>
          option
            .setName("banner")
            .setDescription("Anexo da imagem do seu novo banner.")
            .setRequired(true),
        ),
    ),
  run: async ({ interaction }) => {
    const { user } = interaction;

    const characterGroup = await characterProfile.find({ userID: user.id });
    const names = characterGroup.map((data) => ({
      name: data.info.name,
    }));

    switch (interaction.options.getSubcommand()) {
      case "nome":
        const newName = interaction.options.get("nome").value;

        switch (names.lenght) {
          case 1:
            await characterProfile.findOneAndUpdate(
              {
                userID: user.id,
                "info.name": names[0].name,
              },
              {
                "info.name": newName,
              },
              {
                returnOriginal: false,
              },
            );

            const embed = [
              {
                color: 0x1bb76e,
                author: {
                  name: "Nome alterado com sucesso!",
                  icon_url: "https://i.imgur.com/hss9I60.png",
                },
                title: `Olá, ${newName}!`,
                description: `O personagem ${character} teve seu nome mudado para ${newName}!`,
                image: {
                  url: "https://i.imgur.com/rg4KxSi.png",
                },
              },
            ];
            reply.edit({
              content: "",
              embeds: embed,
              components: [],
            });
            break;
          default:
            const actionRow = {
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
                    description: `Mude o nome de ${characters.name} para ${newName}!`,
                    value: characters.name,
                    emoji: "📝",
                  })),
                },
              ],
            };

            const reply = await interaction.reply({
              content: `Selecione abaixo qual dos seus personagens você deseja alterar o nome para ${newName}.`,
              components: [actionRow],
            });

            const collector = reply.createMessageComponentCollector({
              componentType: ComponentType.StringSelect,
              filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === interaction.id,
              time: 60_000,
            });
            collector.on("collect", async (interaction) => {
              const character = interaction.values[0];

              await characterProfile.findOneAndUpdate(
                {
                  userID: user.id,
                  "info.name": character,
                },
                {
                  "info.name": newName,
                },
                {
                  returnOriginal: false,
                },
              );

              const embed = [
                {
                  color: 0x1bb76e,
                  author: {
                    name: "Nome alterado com sucesso!",
                    icon_url: "https://i.imgur.com/hss9I60.png",
                  },
                  title: `Olá, ${newName}!`,
                  description: `O personagem ${character} teve seu nome mudado para ${newName}!`,
                  image: {
                    url: "https://i.imgur.com/rg4KxSi.png",
                  },
                },
              ];
              reply.edit({
                content: "",
                embeds: embed,
                components: [],
              });
            });
            break;
        }
        break;
      case "apelidos":
        const newNicknames = interaction.options.get("apelidos").value;

        switch (names.lenght) {
          case 1:
            const query = await characterProfile.findOneAndUpdate(
              {
                userID: user.id,
                "info.name": names[0].name,
              },
              {
                "info.nicknames": newNicknames,
              },
              {
                returnOriginal: false,
              },
            );

            const embed = [
              {
                color: 0x1bb76e,
                author: {
                  name: "Apelidos alterados com sucesso!",
                  icon_url: "https://i.imgur.com/hss9I60.png",
                },
                title: `Opa, novos apelidos!`,
                description: `Os apelidos do personagem ${query.info.name} foram alterados para **${newNicknames}**!`,
                image: {
                  url: "https://i.imgur.com/rg4KxSi.png",
                },
              },
            ];
            interaction.reply({
              content: "",
              embeds: embed,
              components: [],
            });
            break;
          default:
            const actionRowApelidos = {
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
                    description: `Mude os apelidos de ${characters.name}!`,
                    value: characters.name,
                    emoji: "📝",
                  })),
                },
              ],
            };

            const reply = await interaction.reply({
              content: `Selecione abaixo qual dos seus personagens você deseja alterar os apelidos.`,
              components: [actionRowApelidos],
            });

            const collector = reply.createMessageComponentCollector({
              componentType: ComponentType.StringSelect,
              filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === interaction.id,
              time: 60_000,
            });
            collector.on("collect", async (interaction) => {
              const character = interaction.values[0];

              const query = await characterProfile.findOneAndUpdate(
                {
                  userID: user.id,
                  "info.name": character,
                },
                {
                  "info.nicknames": newNicknames,
                },
                {
                  returnOriginal: false,
                },
              );

              const embed = [
                {
                  color: 0x1bb76e,
                  author: {
                    name: "Apelidos alterados com sucesso!",
                    icon_url: "https://i.imgur.com/hss9I60.png",
                  },
                  title: `Opa, novos apelidos!`,
                  description: `Os apelidos do personagem ${query.info.name} foram alterados para **${newNicknames}**!`,
                  image: {
                    url: "https://i.imgur.com/rg4KxSi.png",
                  },
                },
              ];
              reply.edit({
                content: "",
                embeds: embed,
                components: [],
              });
            });
            break;
        }
        break;
      case "avatar":
        await interaction.deferReply();

        const avatarURL =
          interaction.options.getAttachment("avatar") == null
            ? "https://i.imgur.com/12wvWQo.png"
            : interaction.options.getAttachment("avatar").url;

        //Avatar
        const avatarResponse = await axios.get(avatarURL, {
          responseType: "arraybuffer",
        });
        const avatarBuffer = Buffer.from(avatarResponse.data);
        const avatarAttachment = new AttachmentBuilder(avatarBuffer, {
          name: "avatar.png",
        });

        switch (names.lenght) {
          case 1:
            const embed = [
              {
                color: 0x1bb76e,
                author: {
                  name: "Avaltar alterado com sucesso!",
                  icon_url: "https://i.imgur.com/hss9I60.png",
                },
                title: `Epa! Fez plástica?!`,
                description: `O avatar de ${names[0].name} foi alterado, gostou do novo estilo?`,
                thumbnail: {
                  url: "attachment://avatar.png",
                },
              },
            ];

            const message = await interaction.editReply({
              content: "",
              components: [],
              embeds: embed,
              files: [avatarAttachment],
              fetchReply: true,
            });

            //Atualizando para que o avatar tenha link permanente e não temporário.
            const avatar = message.embeds[0].thumbnail.url;

            await characterProfile.findOneAndUpdate(
              {
                userID: user.id,
                "info.name": names[0].name,
              },
              {
                "info.avatar": avatar,
              },
              {
                returnOriginal: false,
              },
            );
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
                    description: `Mude o avatar de ${characters.name}!`,
                    value: characters.name,
                    emoji: "📝",
                  })),
                },
              ],
            };

            const reply = await interaction.editReply({
              content: `Selecione abaixo qual dos seus personagens você deseja alterar o avatar.`,
              components: [actionRowAvatar],
            });

            const collector = reply.createMessageComponentCollector({
              componentType: ComponentType.StringSelect,
              filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === interaction.id,
              time: 60_000,
            });
            collector.on("collect", async (interaction) => {
              const character = interaction.values[0];

              const embed = [
                {
                  color: 0x1bb76e,
                  author: {
                    name: "Avaltar alterado com sucesso!",
                    icon_url: "https://i.imgur.com/hss9I60.png",
                  },
                  title: `Epa! Fez plástica?!`,
                  description: `O avatar de ${character} foi alterado, gostou do novo estilo?`,
                  thumbnail: {
                    url: "attachment://avatar.png",
                  },
                },
              ];

              const message = await interaction.message.edit({
                content: "",
                components: [],
                embeds: embed,
                files: [avatarAttachment],
                fetchReply: true,
              });

              //Atualizando para que o avatar tenha link permanente e não temporário.
              const avatar = message.embeds[0].thumbnail.url;

              await characterProfile.findOneAndUpdate(
                {
                  userID: user.id,
                  "info.name": character,
                },
                {
                  "info.avatar": avatar,
                },
                {
                  returnOriginal: false,
                },
              );
            });
            break;
        }
        break;
      case "banner":
        await interaction.deferReply();

        const bannerURL =
          interaction.options.getAttachment("banner") == null
            ? "https://i.imgur.com/9WzYDnk.png"
            : interaction.options.getAttachment("banner").url;

        //Avatar
        const bannerResponse = await axios.get(bannerURL, {
          responseType: "arraybuffer",
        });
        const bannerBuffer = Buffer.from(bannerResponse.data);
        const bannerAttachment = new AttachmentBuilder(bannerBuffer, {
          name: "banner.png",
        });

        switch (names.lenght) {
          case 1:
            const embed = [
              {
                color: 0x1bb76e,
                author: {
                  name: "Banner alterado com sucesso!",
                  icon_url: "https://i.imgur.com/hss9I60.png",
                },
                title: `Ah, agora sim, bela vista!`,
                description: `O banner de ${names[0].name} foi alterado, gostou do novo estilo?`,
                image: {
                  url: "attachment://banner.png",
                },
              },
            ];

            const message = await interaction.editReply({
              content: "",
              components: [],
              embeds: embed,
              files: [bannerAttachment],
              fetchReply: true,
            });

            //Atualizando para que o avatar tenha link permanente e não temporário.
            const banner = message.embeds[0].image.url;

            await characterProfile.findOneAndUpdate(
              {
                userID: user.id,
                "info.name": names[0].name,
              },
              {
                "info.banner": banner,
              },
              {
                returnOriginal: false,
              },
            );
            break;
          default:
            const actionRowBanner = {
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
                    description: `Mude o banner de ${characters.name}!`,
                    value: characters.name,
                    emoji: "📝",
                  })),
                },
              ],
            };

            const reply = await interaction.editReply({
              content: `Selecione abaixo qual dos seus personagens você deseja alterar o banner.`,
              components: [actionRowBanner],
            });

            const collector = reply.createMessageComponentCollector({
              componentType: ComponentType.StringSelect,
              filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === interaction.id,
              time: 60_000,
            });
            collector.on("collect", async (interaction) => {
              const character = interaction.values[0];

              const embed = [
                {
                  color: 0x1bb76e,
                  author: {
                    name: "Banner alterado com sucesso!",
                    icon_url: "https://i.imgur.com/hss9I60.png",
                  },
                  title: `Ah, agora sim, bela vista!`,
                  description: `O banner de ${character} foi alterado, gostou do novo estilo?`,
                  image: {
                    url: "attachment://banner.png",
                  },
                },
              ];

              const message = await interaction.message.edit({
                content: "",
                components: [],
                embeds: embed,
                files: [bannerAttachment],
                fetchReply: true,
              });

              //Atualizando para que o avatar tenha link permanente e não temporário.
              const banner = message.embeds[0].image.url;

              await characterProfile.findOneAndUpdate(
                {
                  userID: user.id,
                  "info.name": character,
                },
                {
                  "info.banner": banner,
                },
                {
                  returnOriginal: false,
                },
              );
            });
            break;
        }
        break;
    }
  },
};
