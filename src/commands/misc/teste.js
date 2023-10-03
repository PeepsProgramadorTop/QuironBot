const {
    Client,
    Interaction,
    Attachment,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    EmbedBuilder,
    AttachmentBuilder
} = require('discord.js');
const sharp = require('sharp');
const axios = require('axios');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     *
     */
    callback: async (client, interaction) => {
        const user = interaction.user;
        
        // Baixe a imagem do avatar do usuário.
        const avatarURL = "https://i.imgur.com/N9O1x8R.png" + Date.now();
        const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // Redimensione a imagem do avatar para o tamanho desejado (por exemplo, 200x200 pixels).
        const resizedBuffer = await sharp(imageBuffer)
            .resize(958, 400)
            .toBuffer();

        // Crie um objeto de anexo com a imagem redimensionada.
        const attachment = new AttachmentBuilder(resizedBuffer, { name: 'aaaaaa.png'});

        // Responda à interação com a imagem redimensionada.
        interaction.reply({ content: "Aqui está a imagem redimensionada:", files: [attachment] });
    },

    name: 'teste',
    description: 'Redimensiona a imagem do avatar do usuário.'
};