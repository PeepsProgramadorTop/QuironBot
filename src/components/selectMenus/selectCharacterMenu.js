module.exports = {
    data: {
        name: "selectCharacterMenu"
    },
    async execute(interaction, userID) {
        if (userID !== interaction.user.id) return interaction.reply("tu nn é o dono");
        // Agora você pode acessar o nome do personagem selecionado como um parâmetro
        interaction.reply(`Você selecionou o personagem: ${interaction.values[0]}`);
    }
}