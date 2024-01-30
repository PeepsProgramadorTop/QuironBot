require("dotenv").config();
const { Client, Partials, IntentsBitField } = require("discord.js");
const { CommandHandler } = require("djs-commander");
const { readdirSync } = require("fs");
const mongoose = require("mongoose");
const path = require("path");

//Definindo o Client
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
client.constants = new Map();

const process = require("node:process");

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

//Deletar um commando
/* 
client.on("ready", () => {
    client.application.commands.fetch('ID DO COMANDO').then((command) => {
        console.log(`Fetched command ${command.name}`)
        // further delete it like so:
        command.delete()
        console.log(`Deleted command ${command.name}`)
    }).catch(console.error);
})
*/

//Carregando pasta Functions
const functionFolders = readdirSync("./src/functions");
for (const folder of functionFolders) {
  const functionFiles = readdirSync(`./src/functions/${folder}`).filter(
    (file) => file.endsWith(".js"),
  );
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

//Conectando a database
(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI, { keepAlive: true });
    console.log("Conectado a database.");
  } catch (error) {
    console.log(`Erro: ${error}`);
  }
})();

//Handlers & Login
new CommandHandler({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
}); //Events & Commands Handler

client.login(process.env.TOKEN);
