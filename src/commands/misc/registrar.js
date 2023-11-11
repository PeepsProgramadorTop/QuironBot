const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const playerProfile = require("../../models/playerProfile");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("registrar")
        .setDescription("Registra um novo personagem para você.")
        //Opção - Prefixo
        .addStringOption((option) => option
            .setName("prefixo")
            .setDescription(
                "Prefixo utilizado para enviar mensagens com o personagem.",
            )
            .setRequired(true),
        )
        //Opção - Nome
        .addStringOption((option) => option
            .setName("nome")
            .setDescription("Nome do personagem que você quer criar.")
            .setRequired(true),
        )
        //Opção - Chalé
        .addStringOption((option) => option
            .setName("chalé")
            .setDescription("Chalé do personagem que você que criar.")
            .addChoices(
                { name: "Zeus", value: "Zeus" },
                { name: "Poseidon", value: "Poseidon" },
                { name: "Deméter", value: "Demeter" },
                { name: "Ares", value: "Ares" },
                { name: "Atena", value: "Atena" },
                { name: "Apolo", value: "Apolo" },
                { name: "Ártemis", value: "Ártemis" },
                { name: "Hefesto", value: "Hefesto" },
                { name: "Afrodite", value: "Afrodite" },
                { name: "Hermes", value: "Hermes" },
                { name: "Dionísio", value: "Dionísio" },
                { name: "Hades", value: "Hades" },
                { name: "Íris", value: "Íris" },
                { name: "Hipnos", value: "Hipnos" },
                { name: "Nêmesis", value: "Nêmesis" },
                { name: "Nike", value: "Nike" },
                { name: "Hebe", value: "Hebe" },
                { name: "Tique", value: "Tique" },
                { name: "Hécate", value: "Hécate" },
            )
            .setRequired(true),
        )
        //Opção - Apelidos
        .addStringOption((option) => option
            .setName("apelidos")
            .setDescription("Apelidos para o personagem que você quer criar.")
            .setRequired(false),
        )
        //Opção - Avatar
        .addAttachmentOption((option) => option
            .setName("avatar")
            .setDescription("Avatar/imagem do personagem que você quer criar.")
            .setRequired(false),
        )
        //Opção - Banner
        .addAttachmentOption((option) => option
            .setName("banner")
            .setDescription(
                "Imagem decorativa localizada no perfil do personagem, retangular, 958x400px recomendados.",
            )
            .setRequired(false),
        ),
    run: async ({ interaction }) => {
        //Consts gerais
        const user = interaction.user;
        const guild = interaction.guild;
        const prefix = interaction.options.get("prefixo").value;
        const name = interaction.options
            .get("nome")
            .value.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9\s]+/g, "")
            .replaceAll(" ", ".");
        const displayName = interaction.options.get("nome").value;
        const cabin = interaction.options.get("chalé").value;
        const nicknames = interaction.options.get("apelidos") == null ? "Nenhum apelido." : interaction.options.get("apelidos").value;
        
        const avatarURL = interaction.options.getAttachment("avatar") == null ? "https://i.imgur.com/12wvWQo.png" : interaction.options.getAttachment("avatar").url;
        const bannerURL = interaction.options.getAttachment("banner") == null ? "https://i.imgur.com/9WzYDnk.png" : interaction.options.getAttachment("banner").url;

        //Checa se você já tem um personagem com esse nome.
        const check = await characterProfile.findOne({
            userID: user.id,
            "info.name": name,
        });
        if (check != null && check.info.name == name) {
            interaction.reply("voce já tem esse personagem");
            return;
        }

        const avatarResponse = await axios.get(avatarURL, { responseType: "arraybuffer" });
        const avatarBuffer = Buffer.from(avatarResponse.data);
        const avatarAttachment = new AttachmentBuilder(avatarBuffer, { name: 'avatar.png' })

        const bannerResponse = await axios.get(bannerURL, { responseType: "arraybuffer" });
        const bannerBuffer = Buffer.from(bannerResponse.data);
        const bannerAttachment = new AttachmentBuilder(bannerBuffer, { name: 'banner.png' });


        const embed = {
            color: 0x1BB76E,
            author: {
                name: 'Personagem criado com sucesso!',
                icon_url: 'https://i.imgur.com/hss9I60.png'
            },
            title: `Olá, ${displayName}!`,
            description: 'Pelo visto um(a) novo(a) campista chegou no acampamento! Seja bem-vindo(a) jovem meio-sangue, eu espero que sua aventura aqui seja épica.',
            thumbnail: {
                url: 'attachment://avatar.png',
            },
            image: {
                url: 'attachment://banner.png',
            },
            footer: {
                text: `Nome Registrado: ${name}`
            }
        };

        const message = await interaction.reply({ embeds: [embed], files: [avatarAttachment, bannerAttachment], fetchReply: true });

        const avatar = message.embeds[0].thumbnail.url;
        const banner = message.embeds[0].image.url;

        await characterProfile.findOneAndUpdate(
            {
                userID: user.id,
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
                        avatar: avatar, //Avatar do Personagem
                        nicknames: nicknames, //Apelidos do Personagem
                        hitPoints: {
                            base: 25, //HP Base
                            current: 25, //HP Atual
                        }, //HP
                    },
                },
            },
            {
                upsert: true,
            },
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
            },
        );
    },
};
