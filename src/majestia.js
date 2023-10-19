/* 
          MAJESTIA.JS
        Contribuidores:
           Photon



### Exemplo newCommand


const utils = require('./majestia.js');


client.on('messageCreate', (message) => {

let prefix = "+";

utils.newCommand({
name: "ping",
aliases: ["ms", "latência"],
caseSensitive: false, 
message: message,
prefix: prefix,
callback: (cmd) => {
cmd.message.reply(`oi bb a latência é ${client.ws.ping}`)
},
})

});

### Exemplo com utilidades mongo

const utils = require('./majestia.js');


async () => {
await utils.mongo.get('../../models/item.js', { name: "espada" });  //Retorna o modelo do item espada

await utils.mongo.set('../../models/item.js',  { name: "espada" }, { $set: { dano: 10 } } ) //Muda o dano da espada para 10
}

*/

const timeout = [];

const utils = {
    newCommand: (command) => {
        switch (command.type) {
            case ('@interaction'):
                if (command.response === '@any') {
                    command.callback(command);
                }
                if (command.interaction.customId == command.response || command.interaction.values[0] == command.response) {
                    command.callback(command);
                }
                break;
            default:
                try {
                    command.args = command.message.content.replace(/\s+/g, ' ').split(' ');
                    command.arg = command.message.content.replace(/\s+/g, ' ');
                    switch (command.name) {
                        case '@any':
                            command.callback(command);
                            break;
                        case '@mentionCommand':
                            const { clientId } = require("../config.json");

                            if (command.message.content.startsWith(`<@${clientId}>`) || command.message.content.startsWith(`<@!${clientId}>`)) {
                                command.callback(command);
                            }
                            break;
                        default:
                            let already = false;
                            let checker = [command.message.content, command.name];
                            if (!command.caseSensitive) {
                                checker.forEach((v, i) => checker[i] = checker[i].toLowerCase())
                            }

                            if (checker[0].startsWith(command.prefix + checker[1])) {
                                command.callback(command)
                                already = true;
                            }
                            try {
                                command.aliases.forEach((v) => {
                                    let checker = [command.message.content, v];
                                    if (!command.caseSensitive) {
                                        checker.forEach((v, i) => checker[i] = checker[i].toLowerCase())
                                    }
                                    if (checker[0].startsWith(command.prefix + checker[1]) && !already) {
                                        command.callback(command)
                                        already = true;
                                    }
                                })
                            } catch { }
                            break;
                    }
                }
                catch (error) {
                    console.log(`Erro ao executar comando ${command.name}: ${error}`)
                    break;
                }
        }
    },
    mongo: {
        get: async (path, key) => {
            let model = require(path);
            let result = await model.findOne(key).clone();

            return result;
        },
        set: async (path, key, newList, options) => {
            let model = require(path);
            return await model.findOneAndUpdate(key, newList, options, (data, doc) => {
                return doc
            }).clone();
        }
    }
}

module.exports = utils;