const {
  SlashCommandBuilder,
  AttachmentBuilder,
  ComponentType,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const { createBanner } = require("../../utils/createBanner");
const { getLifeInfo } = require("../../utils/rpInfo");
const Canvas = require("@napi-rs/canvas");
const { join } = require("path");
Canvas.GlobalFonts.registerFromPath(
  join(__dirname, "../..", "fonts", "gg_sans_medium.ttf"),
  "GG Sans Medium",
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Retorna o perfil do personagem escolhido."),
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const { user } = interaction;

    const characterGroup = await characterProfile.find({ userID: user.id });
    const names = characterGroup.map((data) => ({
      name: data.info.name,
      cabin: data.info.cabin,
    }));

    switch (names.length) {
      case 0:
        interaction.editReply("Você não tem um personagem.");
        break;
      case 1:
        const oldData = await characterProfile.findOne({
          userID: user.id,
          "info.name": names[0].name,
        });

        const { base, bonusPerLvl } = getLifeInfo(oldData.info.cabin);
        const xpPoints = oldData.info.level.xpPoints;
        const level = Math.floor(xpPoints / 1000) - 1;
        const CON = Math.floor(oldData.stats.atrCON / 2 - 5);

        const characterInfo = await characterProfile.findOneAndUpdate(
          {
            userID: user.id,
            "info.name": oldData.info.name,
          },
          {
            $set: {
              "info.hitPoints.base": base + CON + level * (bonusPerLvl + CON),
              "info.hitPoints.current":
                oldData.info.hitPoints.current >
                  base + CON + level * (bonusPerLvl + CON) ||
                oldData.info.hitPoints.current == oldData.info.hitPoints.base
                  ? base + CON + level * (bonusPerLvl + CON)
                  : oldData.info.hitPoints.current,
            },
          },
          {
            returnOriginal: false,
          },
        );

        const character = characterInfo.info.name;

        const banner = await createBanner(characterInfo, user);
        const attachment = new AttachmentBuilder(banner, {
          name: `banner.png`,
        });

        const firstActionRow = {
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
                  label: "Agilidade (AGI)",
                  description:
                    "Altere os valores da Agilidade de seu personagem.",
                  value: "editAtrAGI",
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
        };
        const secondActionRow = {
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
        };

        const oneCharReply = await interaction.editReply({
          content: "",
          files: [attachment],
          components: [firstActionRow, secondActionRow],
        });

        //Collector dos botões
        const collectorEditInfo = oneCharReply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (i) =>
            i.user.id === interaction.user.id &&
            i.customId === "editInfoButton",
        });
        collectorEditInfo.on("collect", async (interaction) => {
          //Informações do Personagem Atualizadas
          const updatedcharacterInfo = await characterProfile.findOne({
            userID: user.id,
            "info.name": character,
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
                    value: updatedcharacterInfo.info.prefix,
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
                    value: updatedcharacterInfo.info.name,
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
                    value: updatedcharacterInfo.info.nicknames,
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
            .then(async (modalInteraction) => {
              const newPrefix =
                modalInteraction.fields.getTextInputValue("prefixInput");
              const newName =
                modalInteraction.fields.getTextInputValue("nameInput");
              const newNicknames =
                modalInteraction.fields.getTextInputValue("nicknamesInput");

              const newInfo = await characterProfile.findOneAndUpdate(
                {
                  userID: user.id,
                  "info.name": character,
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

              const banner = await createBanner(newInfo, user);
              const attachment = new AttachmentBuilder(banner, {
                name: "banner.png",
              });

              modalInteraction.reply({
                content: "Informações alteradas com sucesso!",
                ephemeral: true,
              });
              interaction.message.edit({
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
          const updatedcharacterInfo = await characterProfile.findOne({
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
            .then(async (modalInteraction) => {
              const quantityToAdd = Number(
                modalInteraction.fields.getTextInputValue(
                  `quantity${attribute}`,
                ),
              );
              const currentQuantity =
                updatedcharacterInfo.stats[attributeInfo.atrField];
              const quantity = quantityToAdd + currentQuantity;

              const atrPoints =
                updatedcharacterInfo.stats.atrPoints - quantityToAdd;

              if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                modalInteraction.reply({
                  content: "Você tem que colocar um número positivo válido.",
                  ephemeral: true,
                });
                return;
              }
              if (atrPoints < 0) {
                modalInteraction.reply({
                  content: "Você não tem pontos suficientes para esta ação.",
                  ephemeral: true,
                });
                return;
              }

              const updateFields = {
                "stats.atrPoints": atrPoints,
                [`stats.${attributeInfo.atrField}`]: quantity,
              };

              const newInfo = await characterProfile.findOneAndUpdate(
                {
                  userID: user.id,
                  "info.name": character,
                },
                updateFields,
                {
                  returnOriginal: false,
                },
              );

              const banner = await createBanner(newInfo, user);
              const attachment = new AttachmentBuilder(banner, {
                name: "banner.png",
              });

              modalInteraction.reply({
                content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo ${attribute}! Agora você possui ${
                  newInfo.stats[attributeInfo.atrField]
                } pontos neste atributo!`,
                ephemeral: true,
              });
              interaction.message.edit({
                content: "",
                files: [attachment],
              });
            });
        };

        //Collector dos atributos
        const collectorAtr = oneCharReply.createMessageComponentCollector({
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
            character,
            selectedAttribute,
          );
        });
        break;
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
          type: 1, // Action Row
          components: [
            {
              type: 3, // String Select Menu
              custom_id: "selectCharacterMenu",
              placeholder: "Selecione aqui...",
              min_values: 0,
              max_values: 1,
              options: names.map((characters) => {
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
          content:
            "Selecione abaixo um de seus personagens para ver seu status.",
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
          const oldData = await characterProfile.findOne({
            userID: user.id,
            "info.name": character,
          });

          const { base, bonusPerLvl } = getLifeInfo(oldData.info.cabin);
          const xpPoints = oldData.info.level.xpPoints;
          const level = Math.floor(xpPoints / 1000) - 1;
          const CON = Math.floor(oldData.stats.atrCON / 2 - 5);

          const characterInfo = await characterProfile.findOneAndUpdate(
            {
              userID: user.id,
              "info.name": character,
            },
            {
              $set: {
                "info.hitPoints.base": base + CON + level * (bonusPerLvl + CON),
                "info.hitPoints.current":
                  oldData.info.hitPoints.current >
                    base + CON + level * (bonusPerLvl + CON) ||
                  oldData.info.hitPoints.current == oldData.info.hitPoints.base
                    ? base + CON + level * (bonusPerLvl + CON)
                    : oldData.info.hitPoints.current,
              },
            },
            {
              returnOriginal: false,
            },
          );

          const banner = await createBanner(characterInfo, user);
          const attachment = new AttachmentBuilder(banner, {
            name: "banner.png",
          });

          const firstActionRow = {
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
                    description:
                      "Altere os valores da Força de seu personagem.",
                    value: "editAtrFOR",
                    emoji: "🗡️",
                  },
                  {
                    label: "Agilidade (AGI)",
                    description:
                      "Altere os valores da Agilidade de seu personagem.",
                    value: "editAtrAGI",
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
          };
          const secondActionRow = {
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
          };

          await interaction.deferUpdate();
          const reply = await interaction.message.edit({
            content: "",
            files: [attachment],
            components: [firstActionRow, secondActionRow],
          });

          const collectorEditInfo = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
              i.user.id === interaction.user.id &&
              i.customId === "editInfoButton",
          });
          collectorEditInfo.on("collect", async (interaction) => {
            //Informações do Personagem Atualizadas
            const updatedcharacterInfo = await characterProfile.findOne({
              userID: user.id,
              "info.name": character,
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
                      value: updatedcharacterInfo.info.prefix,
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
                      placeholder:
                        "Digite o novo nome para seu personagem aqui.",
                      value: updatedcharacterInfo.info.name,
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
                      value: updatedcharacterInfo.info.nicknames,
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
              .then(async (modalInteraction) => {
                const newPrefix =
                  modalInteraction.fields.getTextInputValue("prefixInput");
                const newName =
                  modalInteraction.fields.getTextInputValue("nameInput");
                const newNicknames =
                  modalInteraction.fields.getTextInputValue("nicknamesInput");

                const newInfo = await characterProfile.findOneAndUpdate(
                  {
                    userID: user.id,
                    "info.name": character,
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

                const banner = await createBanner(newInfo, user);
                const attachment = new AttachmentBuilder(banner, {
                  name: "banner.png",
                });

                modalInteraction.reply({
                  content: "Informações alteradas com sucesso!",
                  ephemeral: true,
                });
                interaction.message.edit({
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
            const updatedcharacterInfo = await characterProfile.findOne({
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
              .then(async (modalInteraction) => {
                const quantityToAdd = Number(
                  modalInteraction.fields.getTextInputValue(
                    `quantity${attribute}`,
                  ),
                );
                const currentQuantity =
                  updatedcharacterInfo.stats[attributeInfo.atrField];
                const quantity = quantityToAdd + currentQuantity;

                const atrPoints =
                  updatedcharacterInfo.stats.atrPoints - quantityToAdd;

                if (isNaN(quantityToAdd) || quantityToAdd < 1) {
                  modalInteraction.reply({
                    content: "Você tem que colocar um número positivo válido.",
                    ephemeral: true,
                  });
                  return;
                }
                if (atrPoints < 0) {
                  modalInteraction.reply({
                    content: "Você não tem pontos suficientes para esta ação.",
                    ephemeral: true,
                  });
                  return;
                }

                const updateFields = {
                  "stats.atrPoints": atrPoints,
                  [`stats.${attributeInfo.atrField}`]: quantity,
                };

                const newInfo = await characterProfile.findOneAndUpdate(
                  {
                    userID: user.id,
                    "info.name": character,
                  },
                  updateFields,
                  {
                    returnOriginal: false,
                  },
                );

                const banner = await createBanner(newInfo, user);
                const attachment = new AttachmentBuilder(banner, {
                  name: "banner.png",
                });

                modalInteraction.reply({
                  content: `Você adicionou ${quantityToAdd} ponto(s) ao atributo ${attribute}! Agora você possui ${
                    newInfo.stats[attributeInfo.atrField]
                  } pontos neste atributo!`,
                  ephemeral: true,
                });
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
              i.user.id === interaction.user.id &&
              i.customId === "atrSelectMenu",
            time: 60_000,
          });
          collectorAtr.on("collect", async (interaction) => {
            const selectedAttribute = interaction.values[0].substring(7); // Remove "editAtr" prefix
            await handleAttributeEdit(
              interaction,
              user,
              character,
              selectedAttribute,
            );
          });
        });
        break;
    }
  },
};
