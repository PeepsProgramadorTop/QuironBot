//Modules
const {
  SlashCommandBuilder,
  AttachmentBuilder,
  ComponentType,
} = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const { join } = require("path");
//Models
const characterDB = require("../../models/characterProfile");
//Utils
const { createCard } = require("../../utils/createBanner");
const { getLifeInfo } = require("../../utils/rpInfo");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Retorna o perfil do personagem escolhido."),
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const { user } = interaction;

    const charactersFromUser = await characterDB.find({ userID: user.id });
    const userCharactersList = charactersFromUser.map((data) => ({
      name: data.info.name,
      cabin: data.info.cabin,
    }));

    async function statusCode(characterName) {
      const oldData = await characterDB.findOne({
        userID: user.id,
        "info.name": characterName,
      });

      const { info, stats } = oldData;
      const { level, hitPoints } = info;

      const { base, bonusPerLvl } = getLifeInfo(info.cabin); //Pegando as informações de vida base e vida adicional por nível para calcular a vida total atual do personagem automaticamente.

      const xpPoints = level.xpPoints; //Pegando a quantidade total de pontos de XP que o personagem possuí.
      const charLevel = Math.floor(xpPoints / 1000) - 1; //Calculando o XP para obter o nível atual do personagem.
      const atrCON = Math.floor(stats.atrCON / 2 - 5); //Calculando o bônus do atributo Constituição.

      const newData = await characterDB.findOneAndUpdate(
        {
          userID: user.id,
          "info.name": info.name,
        },
        {
          $set: {
            "info.hitPoints.base":
              base + atrCON + charLevel * (bonusPerLvl + atrCON),
            "info.hitPoints.current":
              hitPoints.current >
                base + atrCON + charLevel * (bonusPerLvl + atrCON) ||
              hitPoints.current == hitPoints.base
                ? base + atrCON + charLevel * (bonusPerLvl + atrCON)
                : hitPoints.current,
          },
        },
        {
          returnOriginal: false,
        },
      );

      const statusCard = await createCard(newData, user); //Criando o card do status.
      const attachment = new AttachmentBuilder(statusCard, {
        name: `statusCard.png`,
      }); //Transformando o buffer do card em attachment.

      const actionRows = [
        {
          type: 1, // Action Row
          components: [
            {
              type: 3, // String Select Menu
              custom_id: "atrSelectMenu",
              placeholder:
                "Selecione aqui qual dos atributos você quer editar.",
              min_values: 0,
              max_values: 1,
              options: [
                {
                  label: "Contituição (CON)",
                  description:
                    "Altere os valores da Constituição de seu personagem.",
                  value: "editAtrCON",
                  emoji: "🫀",
                },
                {
                  label: "Força (FOR)",
                  description: "Altere os valores da Força de seu personagem.",
                  value: "editAtrFOR",
                  emoji: "🗡️",
                },
                {
                  label: "Destreza (DES)",
                  description:
                    "Altere os valores da Destreza de seu personagem.",
                  value: "editAtrDES",
                  emoji: "🦿",
                },
                {
                  label: "Inteligência (INT)",
                  description:
                    "Altere os valores da Inteligência de seu personagem.",
                  value: "editAtrINT",
                  emoji: "📜",
                },
                {
                  label: "Sabedoria (SAB)",
                  description:
                    "Altere os valores da Sabedoria de seu personagem.",
                  value: "editAtrSAB",
                  emoji: "🦉",
                },
                {
                  label: "Carisma (CAR)",
                  description:
                    "Altere os valores da Carisma de seu personagem.",
                  value: "editAtrCAR",
                  emoji: "✨",
                },
              ],
            },
          ],
        },
        {
          type: 1, //Action Row
          components: [
            {
              type: 2, //Botão - Alterar as Informações
              custom_id: "editInfoButton",
              label: "Alterar as Informações",
              emoji: "📝",
              style: 2, // Secondary
            },
            {
              type: 2, //Botão - Alterar Avatar e Banner
              disabled: true,
              custom_id: "editImagesButton",
              label: "Avatar e Banner só são editáveis por comandos.",
              emoji: "🖼️",
              style: 2, // Secondary
            },
          ],
        },
      ];

      const reply = await interaction.editReply({
        content: "",
        files: [attachment],
        components: actionRows,
      });

      //Collector - Alterar Informações
      const collectorEditInfo = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) =>
          i.user.id === interaction.user.id && i.customId === "editInfoButton",
      });
      collectorEditInfo.on("collect", async (interaction) => {
        //Informações do Personagem Atualizadas
        const updatedData = await characterDB.findOne({
          userID: user.id,
          "info.name": characterName,
        });

        //Construindo o Modal
        const modal = {
          title: "Editar Personagem",
          custom_id: "editCharModal",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "prefixInput",
                  label: "Prefixo:",
                  placeholder:
                    "Digite o novo prefixo para seu personagem aqui.",
                  value: updatedData.info.prefix,
                  min_length: 1,
                  max_length: 4000,
                  style: 1,
                  required: true,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "nameInput",
                  label: "Nome:",
                  placeholder: "Digite o novo nome para seu personagem aqui.",
                  value: updatedData.info.name,
                  min_length: 1,
                  max_length: 4000,
                  style: 1,
                  required: true,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "nicknamesInput",
                  label: "Apelidos:",
                  placeholder:
                    "Digite os novos apelidos para seu personagem aqui.",
                  value: updatedData.info.nicknames,
                  min_length: 1,
                  max_length: 4000,
                  style: 2,
                  required: true,
                },
              ],
            },
          ],
        };

        await interaction.showModal(modal); //Mostrar modal para o usuário

        interaction
          .awaitModalSubmit({
            filter: (i) =>
              i.user.id === interaction.user.id &&
              i.customId === "editCharModal",
            time: 5 * 60_000,
          })
          .then(async (modalInt) => {
            const newPrefix = modalInt.fields.getTextInputValue("prefixInput");
            const newName = modalInt.fields.getTextInputValue("nameInput");
            const newNicknames =
              modalInt.fields.getTextInputValue("nicknamesInput");

            const newInfo = await characterDB.findOneAndUpdate(
              {
                userID: user.id,
                "info.name": characterName,
              },
              {
                "info.prefix": newPrefix,
                "info.name": newName,
                "info.nicknames": newNicknames,
              },
              {
                returnOriginal: false,
              },
            );

            const statusCard = await createCard(newInfo, user); //Criando o card do status.
            const attachment = new AttachmentBuilder(statusCard, {
              name: `statusCard.png`,
            }); //Transformando o buffer do card em attachment.

            //Mandando mensagem efêmera para o usuário.
            modalInt.reply({
              content: "Informações alteradas com sucesso!",
              ephemeral: true,
            });
            //Atualizando o card.
            interaction.editReply({
              content: "",
              files: [attachment],
            });
          });
      });

      //Criando Modals de forma eficiente
      const attributeModals = {
        CON: {
          title: "Editar Atributo - Constituição (CON)",
          custom_id: "editCONModal",
          atrField: "atrCON",
        },
        FOR: {
          title: "Editar Atributo - Força (FOR)",
          custom_id: "editFORModal",
          atrField: "atrFOR",
        },
        AGI: {
          title: "Editar Atributo - Agilidade (AGI)",
          custom_id: "editAGIModal",
          atrField: "atrAGI",
        },
        INT: {
          title: "Editar Atributo - Inteligência (INT)",
          custom_id: "editINTModal",
          atrField: "atrINT",
        },
        SAB: {
          title: "Editar Atributo - Sabedoria (SAB)",
          custom_id: "editSABModal",
          atrField: "atrSAB",
        },
        CAR: {
          title: "Editar Atributo - Carisma (CAR)",
          custom_id: "editCARModal",
          atrField: "atrCAR",
        },
      };
      const createAttributeModal = (attribute) => ({
        type: 1,
        components: [
          {
            type: 4,
            custom_id: `quantity${attribute}`,
            label: "Quantidade:",
            placeholder: `Digite aqui a quantidade de pontos que você quer adicionar a este atributo.`,
            min_length: 1,
            max_length: 3,
            style: 1,
            required: true,
          },
        ],
      });
      const handleAttributeEdit = async (
        interaction,
        user,
        character,
        attribute,
      ) => {
        const updatedData = await characterDB.findOne({
          userID: user.id,
          "info.name": character,
        });

        const attributeModal = createAttributeModal(attribute);
        const attributeInfo = attributeModals[attribute];

        await interaction.showModal({
          title: attributeInfo.title,
          custom_id: attributeInfo.custom_id,
          components: [attributeModal],
        });

        interaction
          .awaitModalSubmit({
            filter: (i) =>
              i.user.id === interaction.user.id &&
              i.customId === attributeInfo.custom_id,
            time: 5 * 60_000,
          })
          .then(async (modalInt) => {
            const quantityToAdd = Number(
              modalInt.fields.getTextInputValue(`quantity${attribute}`),
            );
            const currentQuantity = updatedData.stats[attributeInfo.atrField];
            const quantity = quantityToAdd + currentQuantity;

            const atrPoints = updatedData.stats.atrPoints - quantityToAdd;

            if (isNaN(quantityToAdd) || quantityToAdd < 1) {
              modalInt.reply({
                content: "Você tem que colocar um número positivo válido.",
                ephemeral: true,
              });
              return;
            }
            if (atrPoints < 0) {
              modalInt.reply({
                content: "Você não tem pontos suficientes para esta ação.",
                ephemeral: true,
              });
              return;
            }

            const updateFields = {
              "stats.atrPoints": atrPoints,
              [`stats.${attributeInfo.atrField}`]: quantity,
            };

            const newInfo = await characterDB.findOneAndUpdate(
              {
                userID: user.id,
                "info.name": characterName,
              },
              updateFields,
              {
                returnOriginal: false,
              },
            );

            const statusCard = await createCard(newInfo, user); //Criando o card do status.
            const attachment = new AttachmentBuilder(statusCard, {
              name: `statusCard.png`,
            }); //Transformando o buffer do card em attachment.

            //Mandando mensagem efêmera pro usuário.
            modalInt.reply({
              content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo ${attribute}! Agora você possui ${
                newInfo.stats[attributeInfo.atrField]
              } pontos neste atributo!`,
              ephemeral: true,
            });
            //Atualizando o card.
            interaction.message.edit({
              content: "",
              files: [attachment],
            });
          });
      };

      //Collector dos atributos
      const collectorAtr = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.user.id === interaction.user.id && i.customId === "atrSelectMenu",
        time: 60_000,
      });
      collectorAtr.on("collect", async (interaction) => {
        const selectedAttribute = interaction.values[0].substring(7); // Remove "editAtr" prefix
        await handleAttributeEdit(
          interaction,
          user,
          characterName,
          selectedAttribute,
        );
      });
    }

    //Se o usuário não possuir personagens registrados, execute isto.
    if (userCharactersList.length == 0)
      return interaction.editReply(
        "Este usuário não possui personagens registrados.",
      );

    //Se o usuário possuir apenas um personagem registrado, execute isto.
    if (userCharactersList.length == 1) {
      statusCode(userCharactersList[0].name);
    }
    //Se o usuário possuir mais de um personagem registrado, execute isto.
    if (userCharactersList.length > 1) {
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
        type: 1, // Action Row
        components: [
          {
            type: 3, // String Select Menu
            custom_id: "selectCharacterMenu",
            placeholder: "Selecione aqui...",
            min_values: 0,
            max_values: 1,
            options: userCharactersList.map((characters) => {
              const emoji = emojiMap[characters.cabin] || "❓"; // Se cabine por algum motivo não existir, coloque este emoji.
              return {
                label: characters.name,
                value: characters.name,
                description: `Veja o status de ${characters.name}!`,
                emoji: emoji,
              };
            }),
          },
        ],
      };

      const reply = await interaction.editReply({
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
        await interaction.deferUpdate();
        statusCode(interaction.values[0]);
      });
    }
  },
};
