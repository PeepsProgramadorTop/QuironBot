const { ActivityType } = require("discord.js");

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

module.exports = (client) => {
    setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 10000);
}