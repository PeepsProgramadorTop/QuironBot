const { WebhookClient } = require('discord.js');
const characterProfile = require("../../models/characterProfile");
const webhookSchema = require("../../models/webhookSchema");

module.exports = async (message) => {
    if (message.author.bot) return;

    const user = message.author;
    const channel = message.channel;

    const characterGroup = await characterProfile.find({ userID: user.id });
    const prefixes = characterGroup.map(data => data.info.prefix);

    if (prefixes.some(prefix => message.content.startsWith(prefix)) || message.attachments.size > 0) {
        const prefixUsed = prefixes.find(prefix => message.content.startsWith(prefix));
        if (!prefixUsed) return;
        const contentWithoutPrefix = message.content.slice(prefixUsed.length).trim();

        if (contentWithoutPrefix === "" && message.attachments.size === 0) return; // Retorna se não houver conteúdo nem anexos

        let data = await webhookSchema.findOne({ channel: channel.id });
        const character = await characterProfile.findOne({ 'info.prefix': prefixUsed });

        if (!data) {
            // Se nenhum webhook existir na base de dados, crie um novo
            channel.createWebhook({
                name: 'QuíronHook',
                avatar: 'https://i.imgur.com/3LUWvgi.png',
            }).then(async webhook => {
                await webhookSchema.create({
                    webhookID: webhook.id,
                    webhookToken: webhook.token,
                    channel: channel.id,
                });

                const webhookMessage = {
                    username: character.info.displayName,
                    avatarURL: character.info.avatar,
                };

                if (contentWithoutPrefix !== "") {
                    webhookMessage.content = contentWithoutPrefix;
                }

                // Verifica se há anexos e adiciona-os à mensagem
                if (message.attachments.size > 0) {
                    webhookMessage.files = message.attachments.map(attachment => {
                        return {
                            attachment: attachment.url,
                            name: attachment.name,
                        };
                    });
                }

                // Verifica se a mensagem está respondendo a outra
                if (message.reference) {
                    try {
                        const repliedMessage = await message.channel.messages.fetch(message.reference.messageID);
                        if (repliedMessage) {
                            webhookMessage.content += `\n\nIn response to: [Original Message](${repliedMessage.url})`;
                        }
                    } catch (error) {
                        console.error("Erro ao buscar mensagem original:", error);
                    }
                }

                webhook.send(webhookMessage);
                message.delete();
            });
        } else {
            // Se um webhook já existe, atualize suas informações e use-o
            const webhookClient = new WebhookClient({ id: data.webhookID, token: data.webhookToken });

            const webhookMessage = {
                username: character.info.displayName,
                avatarURL: character.info.avatar,
            };

            if (contentWithoutPrefix !== "") {
                webhookMessage.content = contentWithoutPrefix;
            }

            // Verifica se há anexos e adiciona-os à mensagem
            if (message.attachments.size > 0) {
                webhookMessage.files = message.attachments.map(attachment => {
                    return {
                        attachment: attachment.url,
                        name: attachment.name,
                    };
                });
            }

            // Verifica se a mensagem está respondendo a outra
            if (message.reference) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message?.reference?.messageId);
                    if (repliedMessage) {
                        webhookMessage.content += `\n\nIn response to: [Original Message](${repliedMessage.url})`;
                    }
                } catch (error) {
                    console.error("Erro ao buscar mensagem original:", error);
                }
            }

            webhookClient.send(webhookMessage);
            message.delete();
        }
    }
};