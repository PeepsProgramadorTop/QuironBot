require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const connectionString = process.env.MONGODB_URI;
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true,
  };

  await mongoose.connect(connectionString, mongooseOpts);

  const model = mongoose.model("CharacterProfile", {
    name: String,
    cabin: String,
    prefix: String,
    avatar: String,
    banner: String,
    nicknames: String,
    hitPoints: {
      base: Number,
      current: Number,
    },
  });

  await model.collection.drop();
  console.log("Tabela `characterprofiles` dropada com sucesso!");
}

main();
return;
