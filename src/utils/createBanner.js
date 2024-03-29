const axios = require("axios");
const sharp = require("sharp");
const Canvas = require("@napi-rs/canvas");

const adjustedText = (canvas, text) => {
  const context = canvas.getContext("2d");
  context.fillStyle = "#76787b";

  let fontSize = 25;
  let heightSize = 418;

  do {
    context.font = `${(fontSize -= 1)}px GG Sans Medium`;
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
  const canvas = Canvas.createCanvas(1306, 814);
  const context = canvas.getContext("2d");

  //-------------------------
  //Carregando informações...
  //-------------------------
  const banner = await Canvas.loadImage(resizedBanner);
  const profileBaseLayer = await Canvas.loadImage(
    "./src/images/profileBaseLayer.png",
  );
  const characterAvatar = await Canvas.loadImage(resizedcharacterAvatar);

  //--------------------
  //Carregando chalés...
  //--------------------
  const zeusCabin = await Canvas.loadImage("./src/images/secondLayer/zeus.png");
  const poseidonCabin = await Canvas.loadImage(
    "./src/images/secondLayer/poseidon.png",
  );
  const demeterCabin = await Canvas.loadImage(
    "./src/images/secondLayer/deméter.png",
  );
  const hadesCabin = await Canvas.loadImage(
    "./src/images/secondLayer/hades.png",
  );
  const aresCabin = await Canvas.loadImage("./src/images/secondLayer/ares.png");
  const athenaCabin = await Canvas.loadImage(
    "./src/images/secondLayer/atena.png",
  );
  const apolloCabin = await Canvas.loadImage(
    "./src/images/secondLayer/apolo.png",
  );
  const arthemisCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hephaestusCabin = await Canvas.loadImage(
    "./src/images/secondLayer/hefesto.png",
  );
  const aphroditeCabin = await Canvas.loadImage(
    "./src/images/secondLayer/afrodite.png",
  );
  const hermesCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const dionysusCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const irisCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hypnosCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const nemesisCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const nikeCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hebeCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const tycheCabin = await Canvas.loadImage(
    "./src/images/secondLayer/empty.png",
  );
  const hekateCabin = await Canvas.loadImage(
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
  context.font = "30px GG Sans Medium";
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

  //HP
  context.font = "20px GG Sans Medium";
  context.fillStyle = "#FFFFFF";

  context.fillText(`Vida`, 96, 514);

  //Barra vazia
  context.fillStyle = "#121418";
  context.beginPath();
  context.roundRect(52, 524, barWidth, 42, 12);
  context.closePath();
  context.fill();

  //Barra cheia
  context.fillStyle = "#F2374E";
  context.save(); //Salva
  context.beginPath();
  context.roundRect(52, 524, barWidth, 42, 12);
  context.closePath();
  context.clip();
  context.fillRect(52, 524, (barWidth * hpCurrent) / hpBase, 42);
  context.restore(); //Restaura

  context.font = "22px GG Sans Medium";
  context.fillStyle = "#FFFFFF";
  var textWidth = context.measureText(`${hpCurrent}/${hpBase}HP`).width;

  context.fillText(
    `${hpCurrent}/${hpBase}HP`,
    52 + barWidth / 2 - textWidth / 2,
    552,
  );

  //Nível
  context.font = "20px GG Sans Medium";
  context.fillStyle = "#FFFFFF";

  context.fillText(`Nível ${level}`, 353, 514);

  //Barra vazia
  context.fillStyle = "#121418";
  context.beginPath();
  context.roundRect(309, 524, barWidth, 42, 12);
  context.closePath();
  context.fill();

  //Barra cheia
  context.fillStyle = "#53A4E3";
  context.save(); //Salva
  context.beginPath();
  context.roundRect(309, 524, barWidth, 42, 12);
  context.closePath();
  context.clip();
  context.fillRect(309, 524, (barWidth * xpCurrent) / xpBase, 42);
  context.restore(); //Restaura

  context.font = "22px GG Sans Medium";
  context.fillStyle = "#FFFFFF";
  var textWidth = context.measureText(`${xpCurrent}/${xpBase}xp`).width;

  context.fillText(
    `${xpCurrent}/${xpBase}xp`,
    309 + barWidth / 2 - textWidth / 2,
    552,
  );

  //Dólares
  context.font = "24px GG Sans Medium";
  context.fillText(`$${characterInfo.info.money}`, 103, 625);
  //Dracmas
  context.fillText(
    `${characterInfo.info.dracmas} dracma${
      characterInfo.info.dracmas > 1 || characterInfo.info.dracmas == 0
        ? "s"
        : ""
    }`,
    355,
    625,
  );

  //-------------------------------------------------------------------------
  //Desenhando atributos (Pontos de Atributo / CON, FOR, DES, INT, SAB e CAR)
  //-------------------------------------------------------------------------
  const { atrPoints, atrCON, atrFOR, atrAGI, atrINT, atrSAB, atrCAR } =
    characterInfo.stats;

  context.font = "24px GG Sans Medium";
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
  context.font = "20px GG Sans Medium";
  context.fillStyle = "#828487";
  context.textAlign = "left";
  var textWidth = context.measureText(`@${user.username}`).width;
  context.fillText(`@${user.username}`, canvas.width / 2 - textWidth / 2, 27);

  return canvas.encode("png");
}

module.exports = { createCard };
