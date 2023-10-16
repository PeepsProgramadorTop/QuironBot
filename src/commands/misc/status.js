const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const axios = require("axios");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");
const { join } = require("path");

const applyText = (canvas, text) => {
  const context = canvas.getContext("2d");
  let fontSize = 50;

  do {
    context.font = `${(fontSize -= 10)}px GG Sans Medium`;
  } while (context.measureText(text).width > canvas.width - 400);

  return context.font;
};

Canvas.GlobalFonts.registerFromPath(
  join(__dirname, "../..", "fonts", "gg_sans_medium.ttf"),
  "GG Sans Medium",
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Retorna o perfil do personagem escolhido."),
  run: async ({ interaction }) => {
    const user = interaction.user;

    const characterGroup = await characterProfile.find({ userID: user.id });

    const names = [];
    characterGroup.forEach((data) => {
      names.push({
        name: `${data.info.name}`,
        displayName: `${data.info.displayName}`,
      });
    });

    if (names.length == 1) {
      const query = await characterProfile.findOne({
        userID: user.id,
        "info.name": names[0].name,
      });

      // -------------------------------------
      // Abaixo se inicia a criação do banner!
      // -------------------------------------

      //Consts Gerais
      const bannerURL = query.info.banner;
      const characterAvatarURL = query.info.avatar;
      const response = await axios.get(bannerURL, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data);
      const stripSpecial = (str) =>
        str
          .replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
            "",
          )
          .replace(/\s+/g, " ")
          .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚâêîôÂÊÎÔãõÃÕçÇ\s]/g, "")
          .trim();

      //Registrando Fontes
      Canvas.GlobalFonts.registerFromPath(
        join(__dirname, "../..", "fonts", "windlass.ttf"),
        "Windlass",
      );
      Canvas.GlobalFonts.registerFromPath(
        join(__dirname, "../..", "fonts", "montserrat.ttf"),
        "Montserrat",
      );
      Canvas.GlobalFonts.registerFromPath(
        join(__dirname, "../..", "fonts", "typewriter.ttf"),
        "JMH Typewriter",
      );

      //Criação do background
      const resizedBanner = await sharp(imageBuffer) //pega o banner e redimensiona ele
        .resize(1079, 353)
        .toBuffer();

      const bgCanvas = Canvas.createCanvas(1079, 486); //cria o canvas
      const bgContext = bgCanvas.getContext("2d"); //pega o context 2d do canvas

      const background = await Canvas.loadImage(resizedBanner); //carrega o banner redimensionado

      bgContext.beginPath(); //inicia um novo path
      bgContext.roundRect(0, 0, 1079, 400, 42); //cria um quadrado arredondado
      bgContext.closePath(); //fecha o path
      bgContext.clip(); //recorta o banner na área do path setado (recortará tudo que foi setado depois disso)
      bgContext.drawImage(background, 0, 0, 1079, 353); //desenha o background

      const bannerBackground = bgCanvas.toBuffer("image/png"); //transforma o background em buffer

      //Criação da layer superior

      const layerCanvas = Canvas.createCanvas(1079, 486); //cria o canvas
      const layerContext = layerCanvas.getContext("2d"); //pega o context 2d do canvas

      const backgroundBuffer = await Canvas.loadImage(bannerBackground); //carrega o background do banner
      const bannerLayer = await Canvas.loadImage(
        "./src/images/banner_layer.png",
      ); //carrega a layer superior do banner
      const characterAvatar = await Canvas.loadImage(characterAvatarURL); //carrega o avatar do personagem

      layerContext.drawImage(
        backgroundBuffer,
        0,
        0,
        layerCanvas.width,
        layerCanvas.height,
      ); //desenha o background do banner
      layerContext.drawImage(
        bannerLayer,
        0,
        0,
        layerCanvas.width,
        layerCanvas.height,
      ); //desenha a layer superior do banner
      layerContext.font = applyText(
        layerCanvas,
        `${stripSpecial(query.info.displayName)}`,
      ); //seta a fonte e o tamanho
      layerContext.fillStyle = "#FFFFFF"; //seta a cor
      layerContext.fillText(
        `${stripSpecial(query.info.displayName)}`,
        290,
        420,
      ); //cria um texto com o nome do personagem
      layerContext.font = "29px Montserrat"; //seta a fonte e o tamanho
      layerContext.fillStyle = "#4E4F54"; //seta a cor
      layerContext.fillText(`@${user.username}`, 290, 447); //cria um texto com o username do player dono do personagem

      layerContext.beginPath(); //inicia um novo path
      layerContext.arc(146, 348, 108, 0, Math.PI * 2, true); //cria um círculo
      layerContext.closePath(); //fecha o path
      layerContext.clip(); //recorta o avatar do personagem  na área do path setado (recortará tudo que foi setado depois disso)
      layerContext.drawImage(characterAvatar, 38, 240, 216, 216); //desenha o avatar do personagem

      const resizedBuffer = await layerCanvas.encode("png"); //finaliza o banner para ele ser enviado pro attachment

      const attachment = new AttachmentBuilder(resizedBuffer, {
        name: `banner.png`,
      }); //cria o attachment que será utilizado depois

      // --------------------------------------------------------------------------------------------
      // Aqui termina-se a criação do banner e se inicia a criação e o processo de enviar as embeds.
      // --------------------------------------------------------------------------------------------

      const firstEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Quíron lhe apresenta...`,
          iconURL: "https://i.imgur.com/3LUWvgi.png",
        })
        .setTitle(`📂  —  Arquivo de Semideus(a)︰`)
        .setImage(`attachment://banner.png`);
      const secondEmbed = new EmbedBuilder()
        .setDescription(
          `\`\`\`GERAL:\`\`\`
❤️<:dot:1158109856725733378>**Pontos de Vida︰** \`${query.info.hitPoints.current}/${query.info.hitPoints.base}HP\`
🪙<:dot:1158109856725733378>**Dracmas︰** \`${query.info.money}\`
📊<:dot:1158109856725733378>**Nível︰** \`0\`

\`\`\`COLAR DE CONTAS:\`\`\`
<:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034><:necklace_bead:1158791462922748034>
           
\`\`\`ATRIBUTOS:\`\`\`
🌟<:dot:1158109856725733378>**Ponto(s) de Atributos Restante(s)︰** \`×${query.stats.atrPoints}\`

🫀<:dot:1158109856725733378>**Constituição (CON)︰** \`×${query.stats.atrCON}\`
🗡️<:dot:1158109856725733378>**Força (FOR)︰** \`×${query.stats.atrFOR}\`
🦿<:dot:1158109856725733378>**Agilidade (AGI)︰** \`×${query.stats.atrAGI}\`
🧠<:dot:1158109856725733378>**Inteligência (INT)︰** \`×${query.stats.atrINT}\`
✨<:dot:1158109856725733378>**Carisma (CAR)︰** \`×${query.stats.atrCAR}\`
`,
        )
        .setImage("https://i.imgur.com/rg4KxSi.png");

      interaction.reply({
        content: "",
        embeds: [firstEmbed, secondEmbed],
        files: [attachment],
        components: [],
      });
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
          i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 60_000,
      });

      collector.on("collect", async (interaction) => {
        const character = interaction.values[0];

        const query = await characterProfile.findOne({
          userID: user.id,
          "info.name": character,
        });

        // -------------------------------------
        // Abaixo se inicia a criação do banner!
        // -------------------------------------

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
        const bannerLayer = await Canvas.loadImage(
          "./src/images/status_layer.png",
        );
        const characterAvatar = await Canvas.loadImage(characterAvatarURL);
        const playerAvatar = await Canvas.loadImage(playerAvatarURL);

        const zeusCabin = await Canvas.loadImage("./src/images/chalé_zeus.png");
        const poseidonCabin = await Canvas.loadImage(
          "./src/images/chalé_poseidon.png",
        );
        const demeterCabin = await Canvas.loadImage(
          "./src/images/chalé_deméter.png",
        );
        const aresCabin = await Canvas.loadImage("./src/images/chalé_ares.png");
        const athenaCabin = await Canvas.loadImage(
          "./src/images/chalé_atena.png",
        );
        const apolloCabin = await Canvas.loadImage(
          "./src/images/chalé_apolo.png",
        );
        const arthemisCabin = await Canvas.loadImage(
          "./src/images/chalé_ártemis.png",
        );
        const aphroditeCabin = await Canvas.loadImage(
          "./src/images/chalé_afrodite.png",
        );
        const hadesCabin = await Canvas.loadImage(
          "./src/images/chalé_hades.png",
        );

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
        context.fillText(`${query.info.displayName}`, 296, 298);

        context.font = "35px GG Sans Medium";
        context.fillStyle = "#76787b";
        context.fillText(`Nenhum apelido.`, 296, 335);

        context.font = "29px GG Sans Medium";
        context.fillStyle = "#828487";
        context.fillText(`@${user.username}`, 338, 377);

        //ATRs & Stats
        let font = (context.font = "24px GG Sans Medium");
        let styleGrey = (context.fillStyle = "#828487");
        let styleWhite = (context.fillStyle = "#f7f7f7");

        font;
        styleWhite;
        context.fillText(
          `${query.info.hitPoints.current}/${query.info.hitPoints.base}HP`,
          802,
          636,
        );
        font;
        styleWhite;
        context.fillText(
          `${query.info.money} dracma${query.info.money > 1 ? "s" : ""}`,
          1065,
          636,
        );

        font;
        styleGrey;
        context.fillText(`×${query.stats.atrPoints}`, 305, 531);
        font;
        styleGrey;
        context.fillText(`×${query.stats.atrCON}`, 305, 604);
        font;
        styleGrey;
        context.fillText(`×${query.stats.atrFOR}`, 228, 652);
        font;
        styleGrey;
        context.fillText(`×${query.stats.atrAGI}`, 260, 700);
        font;
        styleGrey;
        context.fillText(`×${query.stats.atrINT}`, 637, 604);
        font;
        styleGrey;
        context.fillText(`×${query.stats.atrSAB}`, 631, 652);
        font;
        styleGrey;
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

        const resizedBuffer = await canvas.encode("png");

        const attachment = new AttachmentBuilder(resizedBuffer, {
          name: `banner.png`,
        });

        // --------------------------------------------------------------------------------------------
        // Aqui termina-se a criação do banner e se inicia a criação e o processo de enviar as embeds.
        // --------------------------------------------------------------------------------------------
        reply.edit({
          content: "",
          files: [attachment],
          components: [],
        });
      });
    }
  },
};
