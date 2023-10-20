const {
  SlashCommandBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  ButtonBuilder,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const axios = require("axios");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");
const { join } = require("path");

Canvas.GlobalFonts.registerFromPath(
  join(__dirname, "../..", "fonts", "gg_sans_medium.ttf"),
  "GG Sans Medium",
);

const createBanner = async (query, user) => {
  const bannerURL = query.info.banner;
  const characterAvatarURL = query.info.avatar;
  const playerAvatarURL = user.avatarURL();
  const response = await axios.get(bannerURL, {
    responseType: "arraybuffer",
  });
  const bannerBuffer = Buffer.from(response.data);
  const resizedBanner = await sharp(bannerBuffer)
    .resize({
      width: 1306,
      height: 400,
      fit: sharp.fit.cover,
      position: sharp.strategy.attention,
    })
    .toBuffer();

  const canvas = Canvas.createCanvas(1306, 758);
  const context = canvas.getContext("2d");

  const background = await Canvas.loadImage(resizedBanner);
  const bannerLayer = await Canvas.loadImage("./src/images/status_layer.png");
  const characterAvatar = await Canvas.loadImage(characterAvatarURL);
  const playerAvatar = await Canvas.loadImage(playerAvatarURL);

  const zeusCabin = await Canvas.loadImage("./src/images/chalé_zeus.png");
  const poseidonCabin = await Canvas.loadImage(
    "./src/images/chalé_poseidon.png",
  );
  const demeterCabin = await Canvas.loadImage("./src/images/chalé_deméter.png");
  const aresCabin = await Canvas.loadImage("./src/images/chalé_ares.png");
  const athenaCabin = await Canvas.loadImage("./src/images/chalé_atena.png");
  const apolloCabin = await Canvas.loadImage("./src/images/chalé_apolo.png");
  const arthemisCabin = await Canvas.loadImage(
    "./src/images/chalé_ártemis.png",
  );
  const aphroditeCabin = await Canvas.loadImage(
    "./src/images/chalé_afrodite.png",
  );
  const hadesCabin = await Canvas.loadImage("./src/images/chalé_hades.png");

  context.save(); //Salva o estado anterior
  context.beginPath();
  context.roundRect(0, 0, 1306, 270, 14);
  context.closePath();
  context.clip();
  context.drawImage(background, 0, 0, 1306, 400);
  context.restore(); //Restaura o estado anterior, para que possamos desenhar outras coisas depois disto.

  context.drawImage(bannerLayer, 0, 0, canvas.width, canvas.height);

  context.save(); //Salva o estado anterior
  context.beginPath();
  context.arc(163, 246, 116, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();
  context.drawImage(characterAvatar, 47, 130, 232, 232);
  context.restore(); //Restaura o estado anterior, para que possamos desenhar outras coisas depois disto.

  context.save(); //Salva o estado anterior
  context.beginPath();
  context.arc(311.5, 367.5, 17.5, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();
  context.drawImage(playerAvatar, 294, 350, 35, 35);
  context.restore(); //Restaura o estado anterior, para que possamos desenhar outras coisas depois disto.

  context.font = "40px GG Sans Medium";
  context.fillStyle = "#f7f7f7";
  context.fillText(
    `${query.info.displayName
      .replace(/[^a-zA-Z0-9\s\-—]+/g, "")
      .replace(/^(?:\s|\p{Emoji})+/gu, "")}`,
    296,
    298,
  );

  context.font = "35px GG Sans Medium";
  context.fillStyle = "#76787b";
  context.fillText(`${query.info.nicknames}`, 296, 335);

  context.font = "29px GG Sans Medium";
  context.fillStyle = "#828487";
  context.fillText(`@${user.username}`, 338, 377);

  //ATRs & Stats
  context.font = "24px GG Sans Medium";
  context.fillStyle = "#f7f7f7";
  context.fillText(
    `${query.info.hitPoints.current}/${query.info.hitPoints.base}HP`,
    802,
    636,
  );
  context.fillText(
    `${query.info.money} dracma${query.info.money > 1 ? "s" : ""}`,
    1065,
    636,
  );
  context.fillText(`Nível ${query.info.xp}`, 802, 695);
  context.fillText(
    `${query.info.mana.current}/${query.info.mana.base} Mana`,
    1065,
    695,
  );
  context.font = "24px GG Sans Medium";
  context.fillStyle = "#76787B";
  context.fillText(`×${query.stats.atrPoints}`, 305, 531);
  context.fillText(`×${query.stats.atrCON}`, 305, 604);
  context.fillText(`×${query.stats.atrFOR}`, 228, 652);
  context.fillText(`×${query.stats.atrAGI}`, 260, 700);
  context.fillText(`×${query.stats.atrINT}`, 637, 604);
  context.fillText(`×${query.stats.atrSAB}`, 631, 652);
  context.fillText(`×${query.stats.atrCAR}`, 613, 700);

  switch (query.info.cabin) {
    case "Zeus":
      context.drawImage(zeusCabin, 308, 175, 336, 59);
      break;
    case "Poseidon":
      context.drawImage(poseidonCabin, 308, 175, 336, 59);
      break;
    case "Hades":
      context.drawImage(hadesCabin, 308, 175, 336, 59);
      break;
    case "Atena":
      context.drawImage(athenaCabin, 308, 175, 336, 59);
      break;
  }

  return canvas.encode("png");
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Retorna o perfil do personagem escolhido."),
  run: async ({ interaction }) => {
    const user = interaction.user;
    const characterGroup = await characterProfile.find({ userID: user.id });
    const names = characterGroup.map((data) => ({
      name: data.info.name,
      displayName: data.info.displayName,
    }));

    if (names.length == 1) {
      const query = await characterProfile.findOne({
        userID: user.id,
        "info.name": names[0].name,
      });
      const resizedBuffer = await createBanner(query, user);

      const attachment = new AttachmentBuilder(resizedBuffer, {
        name: `banner.png`,
      });

      interaction.reply({
        content: "",
        files: [attachment],
        components: [],
      });
    } else if (names.length > 1) {
      const charSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("selectCharacterMenu")
        .setPlaceholder("Selecione aqui.")
        .setMinValues(0)
        .setMaxValues(1)
        .addOptions(
          names.map((characters) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(characters.displayName)
              .setDescription(`Veja o status de ${characters.displayName}!`)
              .setValue(characters.name)
              .setEmoji("1158791462922748034"),
          ),
        );
      const actionRow = new ActionRowBuilder().addComponents(charSelectMenu);

      const reply = await interaction.reply({
        content: "Selecione abaixo um de seus personagens para ver seu status.",
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
        const character = interaction.values[0];
        const query = await characterProfile.findOne({
          userID: user.id,
          "info.name": character,
        });
        const resizedBuffer = await createBanner(query, user);

        const attachment = new AttachmentBuilder(resizedBuffer, {
          name: "banner.png",
        });

        const editButton = new ButtonBuilder()
          .setCustomId("editButton")
          .setLabel("Editar Informações")
          .setStyle("Primary");

        const newActionRow = new ActionRowBuilder().addComponents(editButton);

        await interaction.deferUpdate();
        const reply = await interaction.message.edit({
          content: "",
          files: [attachment],
          components: [newActionRow],
        });

        const collector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (i) =>
            i.user.id === interaction.user.id && i.customId === "editButton",
        });
        collector.on("collect", async (interaction) => {
          const optionsArray = [
            {
              label: "Força",
              value: "atrFOR",
              description: "Atualize os valores do atributo força.",
            },
            {
              label: "Constituição",
              value: "atrCON",
              description: "Atualize os valores do atributo constituição.",
            },
            {
              label: "Destreza",
              value: "atrAGI",
              description: "Atualize os valores do atributo destreza.",
            },
            {
              label: "Inteligência",
              value: "atrINT",
              description: "Atualize os valores do atributo Inteligência.",
            },
            {
              label: "Sabedoria",
              value: "atrSAB",
              description: "Atualize os valores do atributo sabedoria.",
            },
            {
              label: "Carisma",
              value: "atrCAR",
              description: "Atualize os valores do atributo carisma.",
            },
          ];

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("selectMenu") // Set a custom ID for the select menu
            .setPlaceholder("Selecione um atributo"); // Set a placeholder text

          optionsArray.forEach((option) => {
            const selectOption = new StringSelectMenuOptionBuilder()
              .setLabel(option.label)
              .setValue(option.value)
              .setDescription(option.description);

            selectMenu.addOption(selectOption);
          });
          interaction.reply("clicou");
        });
      });
    }
  },
};
