const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const missionSchema = require("../../models/missionSchema");
const characterProfile = require("../../models/characterProfile");
const { v4: uuidv4 } = require("uuid");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("missao")
    .setDescription("Comandos relacionados à missões.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("criar")
        .setDescription("Cria uma missão.")
        .addStringOption((option) =>
          option
            .setName("titulo")
            .setDescription("Nome da missão em questão.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("desc")
            .setDescription("Breve resumo da missão.")
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("conta")
            .setDescription(
              "Imagem da conta que os personagens ganharão quando essa missão acabar."
            )
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("imagem")
            .setDescription("Imagem que ilustre a missão.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cancelar")
        .setDescription("Cancela a missão inserida.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID da missão para cancelar")
            .setRequired(true)
        )
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("player")
        .setDescription("Manipula os players presentes na missão.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("adicionar")
            .setDescription("Adiciona um personagem à mesa.")
            .addUserOption((option) =>
              option
                .setName("jogador")
                .setDescription("Selecione o jogador.")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("personagem")
                .setDescription("Coloque o nome do personagem do jogador.")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("id")
                .setDescription("ID da missão")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remover")
            .setDescription("Remove o jogador e seus personagens da missão.")
            .addUserOption((option) =>
              option
                .setName("jogador")
                .setDescription("Selecione o jogador que você quer remover.")
                .setRequired(true)
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("iniciar")
        .setDescription("Inicia a missão selecionada")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("Adicione o ID da missão")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("finalizar")
        .setDescription("Finaliza a missão selecionada")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("Adicione o ID da missão")
            .setRequired(true)
        )
    ),
  run: async ({ client, interaction }) => {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "criar":
        const user = interaction.user;
        const guild = interaction.guild;
        const title = interaction.options.get("titulo").value;
        const description = interaction.options.get("desc").value;
        const image = interaction.options.getAttachment("imagem");
        const bead = interaction.options.getAttachment("conta");
        const channel = client.channels.cache.get("1183159793662308412");
        const missionID = uuidv4();

        const check = await missionSchema.findOne({
          missionID: missionID,
          masterID: user.id,
        });
        if (check != null && check.missionID == missionID) {
          interaction.reply("Essa missão já foi criada por você.");
          return;
        }

        await missionSchema.findOneAndUpdate(
          {
            missionID: missionID,
            masterID: user.id,
          },
          {
            $set: {
              //missionID = modified.mission.name_masterID
              missionID: missionID,
              masterID: user.id,
              title: title,
              description: description,
              image: image ? image.url : null,
              bead: bead.url,
              progress: false,
            },
          },
          {
            upsert: true,
          }
        );

        const data = await missionSchema.findOne({
          missionID: missionID,
          masterID: user.id,
        });

        var embed = new EmbedBuilder()
          .setAuthor({
            name: `${user.username}`,
            iconURL: `${user.displayAvatarURL({ size: 1024 })}`,
          })
          .setTitle(`${title}`)
          .setDescription(`${description}`)
          .setImage(image ? image.url : null);

        const message = await channel.send({ embeds: [embed] });
        const messageID = message.id;

        await missionSchema.findOneAndUpdate(
          { missionID: missionID },
          { $set: { embedID: messageID } }
        );

        interaction.reply(
          `Missão enviada com sucesso em <#${channel.id}>! O ID da missão é: \`${data.missionID}\``
        );

        break;
      case "cancelar":
        const mission = interaction.options.get("id").value;
        let replyMessage;

        try {
          const deleteResult = await missionSchema.deleteOne({
            missionID: mission,
          });

          if (deleteResult.deletedCount > 0) {
            const missionData = await missionSchema.findOne({
              missionID: mission,
            });
            const channel = client.channels.cache.get("1156525267934781470");

            const message = await channel.messages.fetch(missionData.embedID);

            message
              .delete()
              .then(() => console.log(`Mensagem deletada com sucesso`))
              .catch(console.error);

            replyMessage = "Missão deletada com sucesso.";
          } else {
            replyMessage = "Missão não encontrada.";
          }
        } catch (error) {
          console.error(error);
          replyMessage = "Houve um erro ao tentar deletar a missão.";
        } finally {
          if (replyMessage) {
            interaction.reply(replyMessage);
          }
        }

        break;

      case "player":
        switch (subcommand) {
          case "adicionar":
            try {
              const user = interaction.user;
              const mission = interaction.options.get("id").value;
              const player = interaction.options.get("jogador").value;
              const character = interaction.options.get("personagem").value;
              const channel = client.channels.cache.get("1156525267934781470");

              const missionData = await missionSchema.findOne({
                missionID: mission,
              });
              const characterData = await characterProfile.findOne({
                name: character,
              });

              if (!characterData) {
                interaction.reply({
                  content: "Personagem não encontrado.",
                  ephemeral: true,
                });
                return;
              }

              await missionSchema.findOneAndUpdate(
                { missionID: mission },
                {
                  $push: {
                    players: {
                      playerName: characterData.info.name,
                      userID: player,
                    },
                  },
                }
              );

              const names = missionData.players;
              console.log(names);
              names.toString().replace(",", ", ");
              const missionMessage = await channel.messages.fetch(
                missionData.embedID
              );

              if (!missionMessage) {
                interaction.reply({
                  content: "Messagem da missao não encontrada",
                  ephemeral: true,
                });
                return;
              }

              const updatedEmbed = new EmbedBuilder()
                .setAuthor({
                  name: `${user.username}`,
                  iconURL: `${user.displayAvatarURL({ size: 1024 })}`,
                })
                .setTitle(missionData.title)
                .setDescription(missionData.description)
                .setImage(missionData.image ? image.url : null)
                .addFields({ name: "Jogadores", value: names });

              missionMessage.edit({ embeds: [updatedEmbed] });

              interaction.reply(
                `Jogador ${characterData.info.name} adicionado à missão ${mission} com sucesso!`
              );
            } catch (error) {
              console.error(error);
              interaction.reply({
                content: "Ocorreu um erro ao adicionar o jogador à missão.",
                ephemeral: true,
              });
            }

            break;

          case "remover":
            break;
        }
    }
  },
};
