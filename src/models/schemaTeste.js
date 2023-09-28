const mongoose = require("mongoose");

const schema = new mongoose.Schema({ 
    _id: { type: String, required: true },
    nomeDaPropriedade: { type: String, default: "null" }
});

module.exports = mongoose.model("schemaTeste", schema);
