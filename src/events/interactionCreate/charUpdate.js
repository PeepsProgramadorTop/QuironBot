const CharacterProfile = require("../../models/characterProfile");
const globalVariables = require("../../globalVariables.json");
const { characterInfo } = require("../../commands/misc/status");

module.exports = async (interaction, client) => {
  client.on("interactionCreate", async (interaction) => {
    const UserID = interaction.user.id;
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "status") {
      console.log("Atualizado");

      try {
        let deus = await characterInfo.find({ UserID: UserID }); // Certifique-se de definir corretamente a variável 'cabin'
        console.log(deus);

        deus = deus.info.cabin;

        const valores = globalVariables.find(
          (deus) => deus.name.toLowerCase() === deus.toLowerCase()
        );
        console.log(valores);

        await characterInfo.findOneAndUpdate(
          { cabin: valores.name },
          {
            $set: {
              "info.hitPoints.base":
                deus.info.hitPoints.base +
                (valores.vida_up + atrCON) * (deus.info.xp - 1),
              "info.hitPoints.current":
                deus.info.hitPoints.current +
                (valores.vida_up + atrCON) * (deus.info.xp - 1),
              "stats.atrCON.mod": Math.floor((deus.stats.atrCON.base - 10) / 2),
              "stats.atrFOR.mod": Math.floor((deus.stats.atrFOR.base - 10) / 2),
              "stats.atrAGI.mod": Math.floor((deus.stats.atrAGI.base - 10) / 2),
              "stats.atrSAB.mod": Math.floor((deus.stats.atrSAB.base - 10) / 2),
              "stats.atrINT.mod": Math.floor((deus.stats.atrINT.base - 10) / 2),
              "stats.atrCAR.mod": Math.floor((deus.stats.atrCAR.base - 10) / 2),
            },
          },
          { new: true } // Opção para retornar o novo documento atualizado
        );
      } catch (err) {
        console.log(err);
      }
    }
  });
};
