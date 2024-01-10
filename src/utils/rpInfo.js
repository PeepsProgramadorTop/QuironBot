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

const atrInfo = {
  zeus: {
    CON: 0,
    FOR: 3,
    AGI: 2,
    SAB: 0,
    INT: 0,
    CAR: 0,
  },
  poseidon: {
    CON: 0,
    FOR: 0,
    AGI: 3,
    SAB: 2,
    INT: 0,
    CAR: 0,
  },
  demeter: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 2,
    INT: 3,
    CAR: 0,
  },
  ares: {
    CON: 2,
    FOR: 2,
    AGI: 0,
    SAB: 0,
    INT: 0,
    CAR: 0,
  },
  atena: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 1,
    INT: 3,
    CAR: 0,
  },
  apolo: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 3,
    INT: 0,
    CAR: 1,
  },
  artemis: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 0,
    INT: 0,
    CAR: 0,
  },
  hefesto: {
    CON: 0,
    FOR: 2,
    AGI: 0,
    SAB: 0,
    INT: 2,
    CAR: 0,
  },
  afrodite: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 0,
    INT: 1,
    CAR: 3,
  },
  hermes: {
    CON: 0,
    FOR: 0,
    AGI: 2,
    SAB: 0,
    INT: 0,
    CAR: 2,
  },
  dionisio: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 0,
    INT: 2,
    CAR: 2,
  },
  hades: {
    CON: 0,
    FOR: 0,
    AGI: 3,
    SAB: 0,
    INT: 0,
    CAR: 2,
  },
  iris: {
    CON: 0,
    FOR: 0,
    AGI: 1,
    SAB: 0,
    INT: 0,
    CAR: 2,
  },
  hipnos: {
    CON: 1,
    FOR: 0,
    AGI: 0,
    SAB: 0,
    INT: 2,
    CAR: 0,
  },
  nemesis: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 0,
    INT: 2,
    CAR: 1,
  },
  nike: {
    CON: 0,
    FOR: 0,
    AGI: 2,
    SAB: 0,
    INT: 0,
    CAR: 1,
  },
  hebe: {
    CON: 3,
    FOR: 0,
    AGI: 0,
    SAB: 0,
    INT: 0,
    CAR: 2,
  },
  tique: {
    CON: 0,
    FOR: 0,
    AGI: 3,
    SAB: 0,
    INT: 0,
    CAR: 2,
  },
  hecate: {
    CON: 0,
    FOR: 0,
    AGI: 0,
    SAB: 3,
    INT: 2,
    CAR: 0,
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
  return 0;
}

function getATRInfo(deus) {
  const deusLowerCase = deus
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remover acentos
  const deusNormalized = deusLowerCase.replace(/[^a-zA-Z]/g, ""); // Remover caracteres não alfabéticos

  for (const key in gods) {
    const godNormalized = key.replace(/[^a-zA-Z]/g, "");
    if (godNormalized === deusNormalized) {
      return atrInfo[key];
    }
  }

  console.error(`Deus '${deus}' não encontrado.`);
  return 0;
}

module.exports = { getLifeInfo, getATRInfo };
