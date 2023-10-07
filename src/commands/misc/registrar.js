const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
} = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const playerProfile = require("../../models/playerProfile");

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     *
     */

    callback: async (client, interaction) => {
        //Consts gerais
        const user = interaction.user;
        const guild = interaction.guild;
        const prefix = interaction.options.get("prefixo").value;
        const name = interaction.options.get("nome").value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]+/g, "").replaceAll(" ", ".");
        const displayName = interaction.options.get("nome").value;
        const cabin = interaction.options.get("chalé").value;
        const avatar = interaction.options.getAttachment("avatar") == null ? 'https://i.imgur.com/12wvWQo.png' : interaction.options.getAttachment("avatar").url;
        const banner = interaction.options.getAttachment("banner") == null ? 'https://i.imgur.com/9WzYDnk.png' : interaction.options.getAttachment("banner").url;

        //Checa se você já tem um personagem com esse nome.
        const check = await characterProfile.findOne({ userID: user.id, "info.prefix": prefix, "info.name": name, });
        if (check != null && check.info.name == name) {
            interaction.reply('voce já tem esse personagem');
            return;
        };

        //Seta as coisas.
        await characterProfile.findOneAndUpdate(
            {
                userID: user.id,
                "info.prefix": prefix,
                "info.name": name,
            },
            {
                $set: {
                    userID: user.id, //ID do Usuário dono do Personagem
                    info: {
                        prefix: prefix, //Nome do Personagem
                        name: name, //Nome do Personagem
                        displayName: displayName, //Nome de Exibição do Personagem
                        cabin: cabin, //Chalé do Personagem
                        banner: banner, //Banner do Personagem
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
        
        //Seta o playerProfile
        await playerProfile.findOneAndUpdate(
            {
                userID: user.id,
            },
            {
                $set: {
                    userID: user.id,
                    name: user.username,
                    guildID: guild.id,
                },
            }
        );

        //Pega a data após você setar tudo.
        const data = await characterProfile.findOne({
            userID: user.id,
            "info.prefix": prefix,
            "info.name": name,
        });

        //Responde com as infos
        interaction.reply({
            content: `
Usuário: <@${data.userID}>
Nome: ${data.info.displayName} (${data.info.name})
Chalé: ${data.info.cabin}
Dracmas: ${data.info.money}
Avatar: ${data.info.avatar}
Banner: ${data.info.banner}
HP: ${data.info.hitPoints.base}/${data.info.hitPoints.current}
`,
        });
    },

    name: "registrar",
    description: "Registra um novo personagem para você.",
    options: [
        {
            name: "prefixo",
            description: "Prefixo utilizado para enviar mensagens com o personagem.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "nome",
            description: "Nome do personagem que você quer criar.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "chalé",
            description: "Chalé do personagem que você que criar.",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Zeus",
                    value: "Zeus",
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
                    value: "Atena",
                },
                {
                    name: "Apolo",
                    value: "Apolo",
                },
                {
                    name: "Ártemis",
                    value: "Ártemis",
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
        {
            name: "avatar",
            description: "Avatar/imagem do personagem que você quer criar.",
            type: ApplicationCommandOptionType.Attachment,
            required: false,
        },
        {
            name: "banner",
            description: "Imagem decorativa localizada no perfil do personagem, retangular, 958x400px recomendados.",
            type: ApplicationCommandOptionType.Attachment,
            required: false,
        },
    ],
};
