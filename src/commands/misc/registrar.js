const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */

  callback: async (client, interaction) => {
    const user = interaction.user;
    const guild = interaction.guild;
    const name = interaction.options.get("nome").value;
    const avatar = interaction.options.getAttachment("avatar").url;
    const banner = interaction.options.getAttachment("banner").url;
    const cabin = interaction.options.get("chalé").value;

    await characterProfile.findOneAndUpdate(
      {
        userID: user.id,
        "info.name": name,
      },
      {
        $set: {
          userID: user.id, //ID do Usuário dono do Personagem
          info: {
            name: name, //Nome do Personagem
            cabin: cabin, //Chalé do calango
            banner: banner, //Chalé do calango
            avatar: avatar, //Avatar do Personagem //Dracmas do Personagem
            hitPoints: {
              base: 25, //HP Base
              current: 25, //HP Atual
            }, //HP
          },
        },
      },
      {
        upsert: true,
      }
    );

    const data = await characterProfile.findOne({
      userID: user.id,
      "info.name": name,
    });

    interaction.reply({
      content: `
Usuário: <@${data.userID}>
Nome: ${data.info.name}
Chalé: ${data.info.cabin}
Dracmas: ${data.info.money}
Avatar: ${data.info.avatar}
HP: ${data.info.hitPoints.base}/${data.info.hitPoints.current}
`,
    });
  },

  name: "registrar",
  description: "Registra um novo personagem para você.",
  options: [
    {
      name: "nome",
      description: "Nome do personagem que você quer criar.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "avatar",
      description: "Avatar/imagem do personagem que você quer criar.",
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    },
    {
      name: "banner",
      description: "Imagem decorativa localizada no perfil do personagem, retangular, 958x400px recomendados.",
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    },
    {
      name: "chalé",
      description: "Escolhe a porra do chalé seu merda",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Zeus",
          value: "Zeus",
        },
        {
          name: "Hera",
          value: "Hera",
        },
        {
          name: "Poseidon",
          value: "Poseidon",
        },
        {
          name: "Deméter",
          value: "Demeter",
        },
        {
          name: "Ares",
          value: "Ares",
        },
        {
          name: "Atena",
          value: "Athena",
        },
        {
          name: "Apolo",
          value: "Apollo",
        },
        {
          name: "Ártemis",
          value: "Artemis",
        },
        {
          name: "Hefesto",
          value: "Hefesto",
        },
        {
          name: "Afrodite",
          value: "Afrodite",
        },
        {
          name: "Hermes",
          value: "Hermes",
        },
        {
          name: "Dionísio",
          value: "Dionísio",
        },
        {
          name: "Hades",
          value: "Hades",
        },
        {
          name: "Íris",
          value: "Íris",
        },
        {
          name: "Hipnos",
          value: "Hipnos",
        },
        {
          name: "Nêmesis",
          value: "Nêmesis",
        },
        {
          name: "Nike",
          value: "Nike",
        },
        {
          name: "Hebe",
          value: "Hebe",
        },
        {
          name: "Tique",
          value: "Tique",
        },
        {
          name: "Hécate",
          value: "Hécate",
        },
      ],
      required: true,
    },
  ],
};
