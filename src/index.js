require('dotenv').config();
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const status = [
  {
    name: 'TV Hefesto',
    type: ActivityType.Watching,
  },
  {
    name: 'Banho de Lua - Ártemis',
    type: ActivityType.Listening,
  },
  {
    name: 'Erva Venenosa - Deméter',
    type: ActivityType.Listening,
  },
  {
    name: 'Lança Perfume - Afrodite',
    type: ActivityType.Listening,
  },
  {
    name: 'Estúpido Cúpido - Apolo',
    type: ActivityType.Listening,
  }
];

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI, { keepAlive: true });
    console.log('Connected to DB.');

    eventHandler(client);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

client.on('ready', () => {
  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
});

client.login(process.env.TOKEN);
