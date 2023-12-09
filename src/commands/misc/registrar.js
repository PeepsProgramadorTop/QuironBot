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
		await interaction.deferReply();

        //Info
        const user = interaction.user;
        const guild = interaction.guild;
        const prefix = interaction.options.get("prefixo").value;
        const name = interaction.options.get("nome").value;
        const cabin = interaction.options.get("chalé").value;
        const nicknames = interaction.options.get("apelidos") == null ? "Nenhum apelido." : interaction.options.get("apelidos").value;
        const avatarURL = interaction.options.getAttachment("avatar") == null ? "https://i.imgur.com/12wvWQo.png" : interaction.options.getAttachment("avatar").url;
        const bannerURL = interaction.options.getAttachment("banner") == null ? "https://i.imgur.com/9WzYDnk.png" : interaction.options.getAttachment("banner").url;

        //Checa se já tem um personagem com esse nome.
        const check = await characterProfile.findOne({
            "info.name": name
        }) ?? { info: {} };
        if (check.info.name == name) {
            await interaction.editReply("Já existe um personagem com este nome, por favor tente outro.");
            return;
        };

        //Avatar
        const avatarResponse = await axios.get(avatarURL, { responseType: "arraybuffer" });
        const avatarBuffer = Buffer.from(avatarResponse.data);
        const avatarAttachment = new AttachmentBuilder(avatarBuffer, { name: 'avatar.png' })

        //Banner
        const bannerResponse = await axios.get(bannerURL, { responseType: "arraybuffer" });
        const bannerBuffer = Buffer.from(bannerResponse.data);
        const bannerAttachment = new AttachmentBuilder(bannerBuffer, { name: 'banner.png' });

        //Embed
        const embed = {
            color: 0x1BB76E,
            author: {
                name: 'Personagem criado com sucesso!',
                icon_url: 'https://i.imgur.com/hss9I60.png'
            },
            title: `Olá, ${name}!`,
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

        //Editando a mensagem para mandar a embed.
        const message = await interaction.editReply({ embeds: [embed], files: [avatarAttachment, bannerAttachment], fetchReply: true });

        //Atualizando para que o avatar e o banner tenham links permanentes e não temporários.
        const avatar = message.embeds[0].thumbnail.url;
        const banner = message.embeds[0].image.url;

        //Setando na database
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
