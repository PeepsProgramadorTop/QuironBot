const axios = require("axios");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");

const adjustedText = (canvas, text) => {
  const context = canvas.getContext("2d");
  context.fillStyle = "#76787b";

  let fontSize = 36;
  let heightSize = 398;

  do {
    context.font = `${(fontSize -= 1)}px GG Sans Medium`;
  } while (context.measureText(text).width > 950);
  do {
    heightSize = heightSize - 6;
  } while (context.measureText(text).heightSize < 28);

  context.font;
  context.fillText(text, 296, heightSize);
};
async function createBanner(characterInfo, user) {
  const playerAvatarURL = user.avatarURL();

  //Avatar do Personagem
  const characterAvatarURL = characterInfo.info.avatar;
  const characterAvatarResponse = await axios.get(characterAvatarURL, {
    responseType: "arraybuffer",
  });
  const characterAvatarBuffer = Buffer.from(characterAvatarResponse.data);
  const resizedcharacterAvatar = await sharp(characterAvatarBuffer)
    .resize({
      width: 232,
      height: 232,
      fit: sharp.fit.cover,
      position: sharp.strategy.attention,
    })
    .toBuffer();

  //Banner do Personagem
  const bannerURL = characterInfo.info.banner;
  const bannerResponse = await axios.get(bannerURL, {
    responseType: "arraybuffer",
  });
  const bannerBuffer = Buffer.from(bannerResponse.data);
  const resizedBanner = await sharp(bannerBuffer)
    .resize({
      width: 1306,
      height: 400,
      fit: sharp.fit.cover,
      position: sharp.strategy.attention,
    })
    .toBuffer();

  //Criando o Canvas
  const canvas = Canvas.createCanvas(1306, 814);
  const context = canvas.getContext("2d");

  //Carregando Informações Básicas
  const banner = await Canvas.loadImage(resizedBanner);
  const statusLayer = await Canvas.loadImage("./src/images/status_layer.png");
  const characterAvatar = await Canvas.loadImage(resizedcharacterAvatar);
  const playerAvatar = await Canvas.loadImage(playerAvatarURL);

  //Carregando Ícones dos Chalés
  const zeusCabin = await Canvas.loadImage("./src/images/chalé_zeus.png");
  const poseidonCabin = await Canvas.loadImage(
    "./src/images/chalé_poseidon.png"
  );
  const demeterCabin = await Canvas.loadImage("./src/images/chalé_deméter.png");
  const aresCabin = await Canvas.loadImage("./src/images/chalé_ares.png");
  const athenaCabin = await Canvas.loadImage("./src/images/chalé_atena.png");
  const apolloCabin = await Canvas.loadImage("./src/images/chalé_apolo.png");
  const arthemisCabin = await Canvas.loadImage(
    "./src/images/chalé_ártemis.png"
  );
  const aphroditeCabin = await Canvas.loadImage(
    "./src/images/chalé_afrodite.png"
  );
  const hephaestusCabin = await Canvas.loadImage(
    "./src/images/chalé_hefesto.png"
  );
  const hermesCabin = await Canvas.loadImage("./src/images/chalé_hermes.png");
  const dionysusCabin = await Canvas.loadImage(
    "./src/images/chalé_dionísio.png"
  );
  const hadesCabin = await Canvas.loadImage("./src/images/chalé_hades.png");
  const irisCabin = await Canvas.loadImage("./src/images/chalé_íris.png");
  const hypnosCabin = await Canvas.loadImage("./src/images/chalé_hipnos.png");
  const nemesisCabin = await Canvas.loadImage("./src/images/chalé_nêmesis.png");
  const nikeCabin = await Canvas.loadImage("./src/images/chalé_nike.png");
  const hebeCabin = await Canvas.loadImage("./src/images/chalé_hebe.png");
  const tycheCabin = await Canvas.loadImage("./src/images/chalé_tique.png");
  const hekateCabin = await Canvas.loadImage("./src/images/chalé_hécate.png");

  //Desenhando o Banner
  context.save(); //Salva
  context.beginPath();
  context.roundRect(0, 0, 1306, 310, 12);
  context.closePath();
  context.clip();
  context.drawImage(banner, 0, 0, 1306, 400);
  context.restore(); //Restaura

  context.drawImage(statusLayer, 0, 0, canvas.width, canvas.height); //Desenhando a layer em cima do banner

  //Desenhando o avatar do personagem
  context.save(); //Salva
  context.beginPath();
  context.arc(163, 302, 116, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();
  context.drawImage(characterAvatar, 47, 186, 232, 232);
  context.restore(); //Restaura

  //Desenhando o avatar do jogador
  context.save(); //Salva
  context.beginPath();
  context.arc(311.5, 423.5, 17.5, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();
  context.drawImage(playerAvatar, 294, 406, 35, 35);
  context.restore(); //Restaura

  //Nome do Personagem
  context.font = "40px GG Sans Medium";
  context.fillStyle = "#f7f7f7";
  context.fillText(
    `${characterInfo.info.name
      .replace(/[^a-zA-Z0-9\s\-—]+/g, "")
      .replace(/^(?:\s|\p{Emoji})+/gu, "")}`,
    296,
    354
  );

  //Apelidos do Personagem
  adjustedText(canvas, characterInfo.info.nicknames);

  //Nome de usuário do jogador
  context.font = "29px GG Sans Medium";
  context.fillStyle = "#828487";
  context.fillText(`@${user.username}`, 338, 433);

  //Informações gerais do personagem (HP, dinheiro, nível, mana, etc...)
  context.font = "24px GG Sans Medium";
  context.fillStyle = "#f7f7f7";
  context.fillText(
    `${characterInfo.info.hitPoints.current}/${characterInfo.info.hitPoints.base}HP`,
    802,
    692
  );
  context.fillText(
    `${characterInfo.info.money} dracma${
      characterInfo.info.money > 1 ? "s" : ""
    }`,
    1065,
    692
  );
  context.fillText(`Nível ${characterInfo.info.xp}`, 802, 751);
  context.fillText(
    `${characterInfo.info.mana.current}/${characterInfo.info.mana.base} Mana`,
    1065,
    751
  );

  //Atributos
  context.font = "24px GG Sans Medium";
  context.fillStyle = "#76787B";
  context.fillText(`×${characterInfo.stats.atrPoints}`, 305, 587);
  context.fillText(
    `×${characterInfo.stats.atrCON}(${Math.floor((atrCON - 10) / 2)})`,
    305,
    660
  );
  context.fillText(
    `×${characterInfo.stats.atrFOR}(${Math.floor((atrFOR - 10) / 2)})`,
    228,
    708
  );
  context.fillText(
    `×${characterInfo.stats.atrAGI}(${Math.floor((atrAGI - 10) / 2)})`,
    260,
    756
  );
  context.fillText(
    `×${characterInfo.stats.atrINT}(${Math.floor((atrINT - 10) / 2)})`,
    637,
    660
  );
  context.fillText(
    `×${characterInfo.stats.atrSAB}(${Math.floor((atrSAB - 10) / 2)})`,
    631,
    708
  );
  context.fillText(
    `×${characterInfo.stats.atrCAR}(${Math.floor((atrCAR - 10) / 2)})`,
    613,
    756
  );

  //Desenhando o ícone do chalé do personagem
  switch (characterInfo.info.cabin) {
    case "Zeus":
      context.drawImage(zeusCabin, 308, 231, 336, 59);
      break;
    case "Poseidon":
      context.drawImage(poseidonCabin, 308, 231, 336, 59);
      break;
    case "Demeter":
      context.drawImage(demeterCabin, 308, 231, 336, 59);
      break;
    case "Ares":
      context.drawImage(aresCabin, 308, 231, 336, 59);
      break;
    case "Atena":
      context.drawImage(athenaCabin, 308, 231, 336, 59);
      break;
    case "Apolo":
      context.drawImage(apolloCabin, 308, 231, 336, 59);
      break;
    case "Ártemis":
      context.drawImage(arthemisCabin, 308, 231, 336, 59);
      break;
    case "Hefesto":
      context.drawImage(hephaestusCabin, 308, 231, 336, 59);
      break;
    case "Afrodite":
      context.drawImage(aphroditeCabin, 308, 231, 336, 59);
      break;
    case "Hermes":
      context.drawImage(hermesCabin, 308, 231, 336, 59);
      break;
    case "Dionísio":
      context.drawImage(dionysusCabin, 308, 231, 336, 59);
      break;
    case "Hades":
      context.drawImage(hadesCabin, 308, 231, 336, 59);
      break;
    case "Íris":
      context.drawImage(irisCabin, 308, 231, 336, 59);
      break;
    case "Hipnos":
      context.drawImage(hypnosCabin, 308, 231, 336, 59);
      break;
    case "Nêmesis":
      context.drawImage(nemesisCabin, 308, 231, 336, 59);
      break;
    case "Nike":
      context.drawImage(nikeCabin, 308, 231, 336, 59);
      break;
    case "Hebe":
      context.drawImage(hebeCabin, 308, 231, 336, 59);
      break;
    case "Tique":
      context.drawImage(tycheCabin, 308, 231, 336, 59);
      break;
    case "Hécate":
      context.drawImage(hekateCabin, 308, 231, 336, 59);
      break;
  }

  return canvas.encode("png");
}

module.exports = { createBanner };
