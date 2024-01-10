const gods = {
  zeus: "Zeus",
  poseidon: "Poseidon",
  demeter: "Deméter",
  ares: "Ares",
  atena: "Atena",
  apolo: "Apolo",
  artemis: "Ártemis",
  hefesto: "Hefesto",
  afrodite: "Afrodite",
  hermes: "Hermes",
  dionisio: "Dionísio",
  hades: "Hades",
  iris: "Íris",
  hipnos: "Hipnos",
  nemesis: "Nêmesis",
  nike: "Nike",
  hebe: "Hebe",
  tique: "Tique",
  hecate: "Hécate",
};

const lifeInfo = {
  zeus: {
    base: 12,
    bonusPerLvl: 7,
  },
  poseidon: {
    base: 12,
    bonusPerLvl: 7,
  },
  demeter: {
    base: 12,
    bonusPerLvl: 7,
  },
  ares: {
    base: 12,
    bonusPerLvl: 7,
  },
  atena: {
    base: 8,
    bonusPerLvl: 5,
  },
  apolo: {
    base: 10,
    bonusPerLvl: 5,
  },
  artemis: {
    base: 10,
    bonusPerLvl: 6,
  },
  hefesto: {
    base: 12,
    bonusPerLvl: 7,
  },
  afrodite: {
    base: 8,
    bonusPerLvl: 5,
  },
  hermes: {
    base: 10,
    bonusPerLvl: 6,
  },
  dionisio: {
    base: 8,
    bonusPerLvl: 5,
  },
  hades: {
    base: 12,
    bonusPerLvl: 7,
  },
  iris: {
    base: 8,
    bonusPerLvl: 5,
  },
  hipnos: {
    base: 8,
    bonusPerLvl: 5,
  },
  nemesis: {
    base: 8,
    bonusPerLvl: 5,
  },
  nike: {
    base: 10,
    bonusPerLvl: 6,
  },
  hebe: {
    base: 8,
    bonusPerLvl: 5,
  },
  tique: {
    base: 8,
    bonusPerLvl: 5,
  },
  hecate: {
    base: 8,
    bonusPerLvl: 5,
  },
};

// Função para obter informações de vida com base no deus
function getLifeInfo(deus) {
  const deusLowerCase = deus
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remover acentos
  const deusNormalized = deusLowerCase.replace(/[^a-zA-Z]/g, ""); // Remover caracteres não alfabéticos

  for (const key in gods) {
    const godNormalized = key.replace(/[^a-zA-Z]/g, "");
    if (godNormalized === deusNormalized) {
      return lifeInfo[key];
    }
  }

  console.error(`Deus '${deus}' não encontrado.`);
  return null;
}

module.exports = { getLifeInfo };
