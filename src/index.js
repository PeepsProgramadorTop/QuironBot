require("dotenv").config();
const { Client, IntentsBitField, ActivityType } = require("discord.js");
const { CommandHandler } = require("djs-commander");
const mongoose = require("mongoose");
const path = require("path");
const utils = require("./majestia.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("messageCreate", (message) => {
  utils.newCommand({
    name: "ping",
    prefix: "q!",
    aliases: ["ms", "latência"],
    caseSensitive: false,
    message: message,
    callback: (cmd) => {
      cmd.message.reply(`oi bb a latência é ${client.ws.ping}`);
    },
  });
});
client.on("messageCreate", (message) => {
  utils.newCommand({
    name: "#mention",
    message: message,
    callback: (cmd) => {
      cmd.message.reply(`OIII`);
    },
  });
});

const status = [
  {
    name: "TV Hefesto",
    type: ActivityType.Watching,
  },
  {
    name: "Banho de Lua - Ártemis",
    type: ActivityType.Listening,
  },
  {
    name: "Erva Venenosa - Deméter",
    type: ActivityType.Listening,
  },
  {
    name: "Lança Perfume - Afrodite",
    type: ActivityType.Listening,
  },
  {
    name: "Estúpido Cúpido - Apolo",
    type: ActivityType.Listening,
  },
];

new CommandHandler({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
});

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI, { keepAlive: true });
    console.log("Connected to DB.");
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

client.on("ready", () => {
  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
});

client.login(process.env.TOKEN);
