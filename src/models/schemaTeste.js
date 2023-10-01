const mongoose = require("mongoose");

var blogSchema = mongoose.Schema({
    userID: { type: "String" }, //Id do Usuário dono do Perso
    inventory: { 
        statOne: { type: "String" },
        statTwo: { type: "String" },
        statThree: { type: "String" },
    }, //Inventário do Perso
});

module.exports = mongoose.model("blogSchema", blogSchema);
