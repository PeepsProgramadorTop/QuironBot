const axios = require("axios");
const { registerFont, createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");
const { join } = require("path");

const adjustedText = (canvas, text) => {
  const context = canvas.getContext("2d");
  context.fillStyle = "#76787b";

  let fontSize = 25;
  let heightSize = 418;

  do {
    context.font = `${(fontSize -= 1)}px 'GG Sans Medium'`;
  } while (context.measureText(text).width > 890);
  do {
    heightSize = heightSize - 6;
  } while (context.measureText(text).heightSize < 28);

  context.font;
  context.fillText(text, 360, heightSize);
};

async function createCard(characterInfo, user) {
  //------------------------------------------
  //Pegando e ajustando o avatar do Personagem
  //------------------------------------------
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

  //------------------------------------------
  //Pegando e ajustando o banner do Personagem
  //------------------------------------------
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

  //-----------------
  //Criando o canvas
  //-----------------
  const canvas = createCanvas(1306, 814);
  const context = canvas.getContext("2d");

  //-------------------------
  //Carregando informações...
  //-------------------------
  const banner = await loadImage(resizedBanner);
  const profileBaseLayer = await loadImage(
    "./src/images/profileBaseLayer.png",
  );
  const characterAvatar = await loadImage(resizedcharacterAvatar);

  //--------------------
  //Carregando chalés...
  //--------------------
  const zeusCabin = await loadImage("./src/images/secondLayer/zeus.png");
  const poseidonCabin = await loadImage(
    "./src/images/secondLayer/poseidon.png",
  );
  const demeterCabin = await loadImage(
    "./src/images/secondLayer/demeter.png",
  );
  const hadesCabin = await loadImage(
    "./src/images/secondLayer/hades.png",
  );
  const aresCabin = await loadImage("./src/images/secondLayer/ares.png");
  const athenaCabin = await loadImage(
    "./src/images/secondLayer/atena.png",
  );
  const apolloCabin = await loadImage(
    "./src/images/secondLayer/apolo.png",
  );
  const arthemisCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hephaestusCabin = await loadImage(
    "./src/images/secondLayer/hefesto.png",
  );
  const aphroditeCabin = await loadImage(
    "./src/images/secondLayer/afrodite.png",
  );
  const hermesCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const dionysusCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const irisCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hypnosCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const nemesisCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const nikeCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hebeCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const tycheCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hekateCabin = await loadImage(
    "./src/images/secondLayer/empty.png",
  );

  //-------------------
  //Desenhando o banner
  //-------------------
  context.save(); //Salva
  context.beginPath();
  context.roundRect(0, 0, 1306, 310, 40);
  context.closePath();
  context.clip();
  context.drawImage(banner, 0, 0, 1306, 400);
  context.restore(); //Restaura

  //-----------------------
  //Desenhando a layer base
  //-----------------------
  context.drawImage(profileBaseLayer, 0, 0, canvas.width, canvas.height);

  //---------------------------------
  //Desenhando o avatar do personagem
  //---------------------------------
  context.save(); //Salva
  context.beginPath();
  context.arc(163, 312, 116, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();
  context.drawImage(characterAvatar, 47, 196, 232, 232);
  context.restore(); //Restaura

  //-------------------------------
  //Desenhando o nome do personagem
  //-------------------------------
  context.font = "30px 'gg sans Medium'";
  context.fillStyle = "#f7f7f7";
  context.fillText(
    `${characterInfo.info.name
      .replace(/[^a-zA-Z0-9\s\-—]+/g, "")
      .replace(/^(?:\s|\p{Emoji})+/gu, "")}`,
    360,
    378,
  );

  //------------------------------------
  //Desenhando os apelidos do personagem
  //------------------------------------
  adjustedText(canvas, characterInfo.info.nicknames);

  //-------------------------------------------------------------------
  //Desenhando informações gerais (HP, dólares, dracmas, nível, etc...)
  //-------------------------------------------------------------------
  const barWidth = 215;
  const hpCurrent = characterInfo.info.hitPoints.current;
  const hpBase = characterInfo.info.hitPoints.base;
  const xpPoints = characterInfo.info.level.xpPoints;
  const level = Math.floor(xpPoints / 1000);
  const xpCurrent = xpPoints - level * 1000;
  const xpBase = 1000;
  const magicXpPoints = characterInfo.info.magicLevel.xpPoints;
  const magicLevel = Math.floor(magicXpPoints / 1000);
  const magicXpCurrent = magicXpPoints - magicLevel * 1000;
  const magicXpBase = 1000;


  //HP
  context.font = "20px 'GG Sans Medium'";
  context.fillStyle = "#FFFFFF";

  context.fillText(`Vida`, 351, 506);

  //Barra vazia
  context.fillStyle = "#121418";
  context.beginPath();
  context.roundRect(306, 516, barWidth, 42, 12);
  context.closePath();
  context.fill();

  //Barra cheia
  context.fillStyle = "#F2374E";
  context.save(); //Salva
  context.beginPath();
  context.roundRect(306, 516, barWidth, 42, 12);
  context.closePath();
  context.clip();
  context.fillRect(306, 516, (barWidth * hpCurrent) / hpBase, 42);
  context.restore(); //Restaura

  context.font = "22px 'GG Sans Medium'";
  context.fillStyle = "#FFFFFF";
  var textWidth = context.measureText(`${hpCurrent}/${hpBase}HP`).width;

  context.fillText(
    `${hpCurrent}/${hpBase}HP`,
    306 + barWidth / 2 - textWidth / 2,
    544,
  );

  //Nível
  context.font = "20px 'GG Sans Medium'";
  context.fillStyle = "#FFFFFF";

  context.fillText(`Nível ${level}`, 351, 607);

  //Barra vazia
  context.fillStyle = "#121418";
  context.beginPath();
  context.roundRect(306, 616, barWidth, 42, 12);
  context.closePath();
  context.fill();

  //Barra cheia
  context.fillStyle = "#53A4E3";
  context.save(); //Salva
  context.beginPath();
  context.roundRect(306, 616, barWidth, 42, 12);
  context.closePath();
  context.clip();
  context.fillRect(306, 616, (barWidth * xpCurrent) / xpBase, 42);
  context.restore(); //Restaura

  context.font = "22px 'GG Sans Medium'";
  context.fillStyle = "#FFFFFF";
  var textWidth = context.measureText(`${xpCurrent}/${xpBase}xp`).width;

  context.fillText(
    `${xpCurrent}/${xpBase}xp`,
    306 + barWidth / 2 - textWidth / 2,
    644,
  );

  //Nível - Magia
  context.font = "20px 'GG Sans Medium'";
  context.fillStyle = "#FFFFFF";

  context.fillText(`Nível Mágico ${magicLevel}`, 223, 707);

  //Barra vazia
  context.fillStyle = "#121418";
  context.beginPath();
  context.roundRect(179, 716, barWidth, 42, 12);
  context.closePath();
  context.fill();

  //Barra cheia
  context.fillStyle = "#70B438";
  context.save(); //Salva
  context.beginPath();
  context.roundRect(179, 716, barWidth, 42, 12);
  context.closePath();
  context.clip();
  context.fillRect(179, 716, (barWidth * magicXpCurrent) / magicXpBase, 42);
  context.restore(); //Restaura

  context.font = "22px 'GG Sans Medium'";
  context.fillStyle = "#FFFFFF";
  var textWidth = context.measureText(`${magicXpCurrent}/${magicXpBase}xp`).width;

  context.fillText(
    `${magicXpCurrent}/${magicXpBase}xp`,
    179 + barWidth / 2 - textWidth / 2,
    744,
  );

  context.font = "24px 'GG Sans Medium'";
  //Dracmas
  context.fillText(
    `${characterInfo.info.dracmas} dracma${characterInfo.info.dracmas > 1 || characterInfo.info.dracmas == 0
      ? "s"
      : ""
    }`,
    106,
    514,
  );
  //Dólares
  context.fillText(`$${characterInfo.info.money}`, 106, 586);
  //C.A
  context.fillText(
    `${8+(2 * (Math.floor(characterInfo.stats.atrAGI / 2 - 5)))} C.A`,
    106,
    651,
  );

  //-------------------------------------------------------------------------
  //Desenhando atributos (Pontos de Atributo / CON, FOR, DES, INT, SAB e CAR)
  //-------------------------------------------------------------------------
  const { atrPoints, atrCON, atrFOR, atrAGI, atrINT, atrSAB, atrCAR } =
    characterInfo.stats;

  context.font = "24px 'GG Sans Medium'";
  context.fillStyle = "#838383";
  context.fillText(`×${atrPoints}`, 855, 582);

  //Primeira Coluna
  context.fillText(`×${atrCON}`, 834, 661);
  context.fillText(`×${atrFOR}`, 765, 709);
  context.fillText(`×${atrAGI}`, 793, 757);
  //Segunda Coluna
  context.fillText(`×${atrINT}`, 1158, 661);
  context.fillText(`×${atrSAB}`, 1153, 709);
  context.fillText(`×${atrCAR}`, 1138, 757);

  //--------------------------------
  //Desenhando o bônus dos atributos
  //--------------------------------
  context.textAlign = "right";

  function drawAtrBonus(context, atr, x, y) {
    context.fillStyle = atr > 9 ? "#60FF6E" : "#FF6060";
    context.fillText(`${Math.floor(atr / 2 - 5)}`, x, y);
  }

  // Primeira Coluna
  drawAtrBonus(context, atrCON, 911, 661);
  drawAtrBonus(context, atrFOR, 911, 709);
  drawAtrBonus(context, atrAGI, 911, 756);
  // Segunda Coluna
  drawAtrBonus(context, atrINT, 1252, 661);
  drawAtrBonus(context, atrSAB, 1252, 709);
  drawAtrBonus(context, atrCAR, 1252, 756);

  //-----------------------------------------------------------------
  //Desenhando a segunda layer (jogador, chalé e decoração de perfil)
  //-----------------------------------------------------------------

  //Segunda Layer
  switch (characterInfo.info.cabin) {
    case "Zeus":
      context.drawImage(zeusCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Poseidon":
      context.drawImage(poseidonCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Demeter":
      context.drawImage(demeterCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Ares":
      context.drawImage(aresCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Atena":
      context.drawImage(athenaCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Apolo":
      context.drawImage(apolloCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Ártemis":
      context.drawImage(arthemisCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Hefesto":
      context.drawImage(hephaestusCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Afrodite":
      context.drawImage(aphroditeCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Hermes":
      context.drawImage(hermesCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Dionísio":
      context.drawImage(dionysusCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Hades":
      context.drawImage(hadesCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Íris":
      context.drawImage(irisCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Hipnos":
      context.drawImage(hypnosCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Nêmesis":
      context.drawImage(nemesisCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Nike":
      context.drawImage(nikeCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Hebe":
      context.drawImage(hebeCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Tique":
      context.drawImage(tycheCabin, 0, 0, canvas.width, canvas.height);
      break;
    case "Hécate":
      context.drawImage(hekateCabin, 0, 0, canvas.width, canvas.height);
      break;
  }

  //Nome do Jogador
  //Nome de usuário do jogador
  context.font = "20px 'GG Sans Medium'";
  context.fillStyle = "#828487";
  context.textAlign = "left";
  var textWidth = context.measureText(`@${user.username}`).width;
  context.fillText(`@${user.username}`, canvas.width / 2 - textWidth / 2, 27);

  return canvas.toBuffer();;
}

module.exports = { createCard };