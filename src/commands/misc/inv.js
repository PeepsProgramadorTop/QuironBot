import { SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Mostra o inventário do personagem.")
    .addUserOption()
};
