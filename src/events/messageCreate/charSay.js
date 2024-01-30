const { WebhookClient, ChannelType } = require("discord.js");
const characterProfile = require("../../models/characterProfile");
const webhookSchema = require("../../models/webhookSchema");
const { getLifeInfo } = require("../../utils/rpInfo");

module.exports = async (message, client) => {
    const user = message.author;
    const channel = message.channel.type === ChannelType.PublicThread ? message.channel.parent : message.channel;

    const characterGroup = await characterProfile.find({ userID: user.id });
    const prefixes = characterGroup.map((data) => data.info.prefix);

    if (prefixes.some((prefix) => message.content.startsWith(prefix)) || message.attachments.size > 0) {
        const prefixUsed = prefixes.find((prefix) =>
            message.content.startsWith(prefix),
        );
        if (!prefixUsed) return;
        const contentWithoutPrefix = message.content
            .slice(prefixUsed.length)
            .trim();

        if (contentWithoutPrefix === "" && message.attachments.size === 0) return; // Retorna se não houver conteúdo nem anexos

        let data = await webhookSchema.findOne({ channel: channel.id });
        const character = await characterProfile.findOne({
            "info.prefix": prefixUsed,
        });

        if (!data) {
            //Se nenhum webhook existir na base de dados, crie um novo
            channel
                .createWebhook({
                    name: "QuíronHook",
                    avatar: "https://i.imgur.com/3LUWvgi.png",
                })
                .then(async (webhook) => {
                    await webhookSchema.create({
                        webhookID: webhook.id,
                        webhookToken: webhook.token,
                        channel: channel.id,
                    });

                    const oldData = await characterProfile.findOne({
                        userID: user.id,
                        "info.name": character.info.name,
                    });
        
                    const { base, bonusPerLvl } = getLifeInfo(oldData.info.cabin);
                    const xpPoints = oldData.info.level.xpPoints;
                    const level = (Math.floor(xpPoints / 1000) - 1);
                    const CON = Math.floor((oldData.stats.atrCON / 2) - 5);
        
                    const characterInfo = await characterProfile.findOneAndUpdate(
                        {
                            userID: user.id,
                            "info.name": oldData.info.name,
                        },
                        {
                            $set: {
                                "info.hitPoints.base": (base + CON) + ((level * (bonusPerLvl + CON))),
                                "info.hitPoints.current": oldData.info.hitPoints.current > ((base + CON) + ((level * (bonusPerLvl + CON)))) || oldData.info.hitPoints.current == oldData.info.hitPoints.base ? (base + CON) + ((level * (bonusPerLvl + CON))) : oldData.info.hitPoints.current,
                            },
                        },
                        {
                            returnOriginal: false,
                        },
                    );
        
                    const webhookMessage = {
                        username:
                        characterInfo.info.name +
                            ` [ ${characterInfo.info.hitPoints.current}/${characterInfo.info.hitPoints.base}HP ]`,
                        avatarURL: characterInfo.info.avatar,
                        threadId: message.channel.type === ChannelType.PublicThread ? message.channel.id : null
                    };

                    if (contentWithoutPrefix !== "") {
                        webhookMessage.content = contentWithoutPrefix;
                    }

                    // Verifica se há anexos e adiciona-os à mensagem
                    if (message.attachments.size > 0) {
                        webhookMessage.files = message.attachments.map((attachment) => {
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
                            const repliedMessageAuthor = await characterProfile.findOne({ "info.name": repliedMessage.author.username.replace(/\s*\[\s*\d+\/\d+HP\s*\]\s*$/, '') });
                            if (repliedMessage) {
                                webhookMessage.content = `> <:deco_chat:1180719307399905280>  Respondendo **@${repliedMessage.author.username}** (<@${repliedMessageAuthor.userID}>) - [Mensagem](${repliedMessage.url})\n\n${webhookMessage.content}`;
                            }
                        } catch (error) {
                            console.error("Erro ao buscar mensagem original:", error);
                        }
                    }

                    webhook.send(webhookMessage)
                    message.delete();
                });
        } else {
            //Se um webhook já existe, atualize suas informações e use-o
            const webhookClient = new WebhookClient({
                id: data.webhookID,
                token: data.webhookToken,
            });
            
            const oldData = await characterProfile.findOne({
                userID: user.id,
                "info.name": character.info.name,
            });

            const { base, bonusPerLvl } = getLifeInfo(oldData.info.cabin);
            const xpPoints = oldData.info.level.xpPoints;
            const level = (Math.floor(xpPoints / 1000) - 1);
            const CON = Math.floor((oldData.stats.atrCON / 2) - 5);

            const characterInfo = await characterProfile.findOneAndUpdate(
                {
                    userID: user.id,
                    "info.name": oldData.info.name,
                },
                {
                    $set: {
                        "info.hitPoints.base": (base + CON) + ((level * (bonusPerLvl + CON))),
                        "info.hitPoints.current": oldData.info.hitPoints.current > ((base + CON) + ((level * (bonusPerLvl + CON)))) || oldData.info.hitPoints.current == oldData.info.hitPoints.base ? (base + CON) + ((level * (bonusPerLvl + CON))) : oldData.info.hitPoints.current,
                    },
                },
                {
                    returnOriginal: false,
                },
            );

            const webhookMessage = {
                username:
                characterInfo.info.name +
                    ` [ ${characterInfo.info.hitPoints.current}/${characterInfo.info.hitPoints.base}HP ]`,
                avatarURL: characterInfo.info.avatar,
                threadId: message.channel.type === ChannelType.PublicThread ? message.channel.id : null
            };

            if (contentWithoutPrefix !== "") {
                webhookMessage.content = contentWithoutPrefix;
            }

            //Verifica se há anexos e adiciona-os à mensagem
            if (message.attachments.size > 0) {
                webhookMessage.files = message.attachments.map((attachment) => {
                    return {
                        attachment: attachment.url,
                        name: attachment.name,
                    };
                });
            }

            //Verifica se a mensagem está respondendo a outra
            if (message.reference) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message?.reference?.messageId);
                    const repliedMessageAuthor = await characterProfile.findOne({ "info.name": repliedMessage.author.username.replace(/\s*\[\s*\d+\/\d+HP\s*\]\s*$/, '') });
                    if (repliedMessage) {
                        webhookMessage.content = `> <:deco_chat:1180719307399905280>  Respondendo **@${repliedMessage.author.username}** (<@${repliedMessageAuthor.userID}>) - [Mensagem](${repliedMessage.url})\n\n${webhookMessage.content}`;
                    }
                } catch (error) {
                    console.error("Erro ao buscar mensagem original:", error);
                }
            }

            webhookClient.send(webhookMessage)
            message.delete();
        }
    }
};