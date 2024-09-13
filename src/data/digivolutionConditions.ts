import { Digimon, Card } from '../shared/types';
import { DigivolutionConnection } from '../components/DigivolutionWeb';

interface DigivolutionCondition {
  targetDigimon: string;
  conditions: (digimon: Digimon) => boolean;
}

export const digivolutionConditions: Record<string, DigivolutionCondition[]> = {
  'pagumon': [
    {
      targetDigimon: 'impmon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.deck.some(card => card.type === 'special')
    },
    {
      targetDigimon: 'goblimon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.attack >= 10
    }
  ],
  'tsumemon': [
    {
      targetDigimon: 'keramon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.deck.some(card => card.name === 'BUG_BLASTER')
    }
  ],
  'koromon': [
    {
      targetDigimon: 'agumon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.attack >= 8
    },
    {
      targetDigimon: 'kamemon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.maxHp >= 60
    },
    {
      targetDigimon: 'monodramon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.critChance >= 0.1
    },
    {
      targetDigimon: 'veemon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.evasion >= 0.1
    },
    {
      targetDigimon: 'guilmon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.deck.some(card => card.type === 'attack')
    }
  ],
  'tsunomon': [
    {
      targetDigimon: 'gabumon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.deck.some(card => card.name === 'BLUE_BLASTER')
    }
  ],
  'tokomon': [
    {
      targetDigimon: 'patamon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.healing >= 6
    },
    {
      targetDigimon: 'lucemon',
      conditions: (digimon: Digimon) => digimon.level >= 10 && digimon.exp >= 1000 && digimon.deck.some(card => card.digimonType === 'VACCINE')
    }
  ],
  'minomon': [
    {
      targetDigimon: 'tentomon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.deck.some(card => card.name === 'SUPER_SHOCKER')
    }
  ],
  'budmon': [
    {
      targetDigimon: 'mushmon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.corruptionResistance >= 0.3
    }
  ],
  'gummymon': [
    {
      targetDigimon: 'terriermon',
      conditions: (digimon: Digimon) => digimon.level >= 5 && digimon.deck.length >= 10
    }
  ],
  'impmon': [
    {
      targetDigimon: 'devimon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.deck.some(card => card.id === 'HELL_CONTRACT')
    },
    {
      targetDigimon: 'vilemon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.critChance >= 0.15
    },
    {
      targetDigimon: 'revolmon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.accuracy >= 1.1
    },
    {
      targetDigimon: 'wizardmon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.deck.filter(card => card.type === 'special').length >= 3
    }
  ],
  'goblimon': [
    {
      targetDigimon: 'vilemon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.attack >= 20
    }
  ],
  'keramon': [
    {
      targetDigimon: 'chrysalimon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.deck.some(card => card.name === 'NETWORK_FLAPPING')
    }
  ],
  'agumon': [
    {
      targetDigimon: 'greymon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.attack >= 25 && digimon.deck.some(card => card.name === 'PEPPER_BREATH')
    }
  ],
  'kamemon': [
    {
      targetDigimon: 'gawappamon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.shield >= 50
    }
  ],
  'gabumon': [
    {
      targetDigimon: 'garurumon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.deck.some(card => card.name === 'BLUE_CYCLONE')
    }
  ],
  'patamon': [
    {
      targetDigimon: 'angemon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.healing >= 15
    }
  ],
  'tentomon': [
    {
      targetDigimon: 'kuwagamon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.attack >= 20
    }
  ],
  'kunemon': [
    {
      targetDigimon: 'kuwagamon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.buggedResistance >= 0.3
    }
  ],
  'mushmon': [
    {
      targetDigimon: 'veggiemon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.corruptionResistance >= 0.4
    }
  ],
  'terriermon': [
    {
      targetDigimon: 'gargomon',
      conditions: (digimon: Digimon) => digimon.level >= 15 && digimon.deck.some(card => card.name === 'BUNNY_BLAST')
    }
  ],
  'devimon': [
    {
      targetDigimon: 'skullknightmon',
      conditions: (digimon: Digimon) => digimon.level >= 30 && digimon.attack >= 40 && digimon.corruptionResistance >= 0.6
    }
  ],
  'chrysalimon': [
    {
      targetDigimon: 'skullknightmon',
      conditions: (digimon: Digimon) => digimon.level >= 30 && digimon.buggedResistance >= 0.5 && digimon.deck.some(card => card.name === 'CRAZY_SMOKE')
    }
  ],
  'revolmon': [
    {
      targetDigimon: 'superstarmon',
      conditions: (digimon: Digimon) => digimon.level >= 30 && digimon.accuracy >= 1.2 && digimon.deck.some(card => card.name === 'RUSSIAN_ROULETTE')
    }
  ],
  'greymon': [
    {
      targetDigimon: 'metalgreymon',
      conditions: (digimon: Digimon) => digimon.level >= 30 && digimon.attack >= 50 && digimon.deck.some(card => card.name === 'MEGA_FLAME')
    }
  ],
  'gawappamon': [
    {
      targetDigimon: 'shawujingmon',
      conditions: (digimon: Digimon) => digimon.level >= 30 && digimon.shield >= 100 && digimon.deck.some(card => card.name === 'DJ_SHOOTER')
    }
  ],
  'sangloupmon': [
    {
      targetDigimon: 'matadormon',
      conditions: (digimon: Digimon) => digimon.level >= 30 && digimon.critChance >= 0.2 && digimon.deck.some(card => card.name === 'BLOODTHIRST')
    }
  ],
  'matadormon': [
    {
      targetDigimon: 'beelzemon',
      conditions: (digimon: Digimon) => digimon.level >= 50 && digimon.attack >= 70 && digimon.deck.some(card => card.name === 'CRAZY_SMOKE')
    }
  ],
  'metalgreymon': [
    {
      targetDigimon: 'wargreymon',
      conditions: (digimon: Digimon) => digimon.level >= 50 && digimon.attack >= 80 && digimon.deck.some(card => card.name === 'GIGA_DESTROYER')
    },
    {
      targetDigimon: 'kimeramon',
      conditions: (digimon: Digimon) => digimon.level >= 50 && digimon.maxHp >= 200 && digimon.deck.some(card => card.name === 'HEAT_VIPER')
    }
  ],
  'shawujingmon': [
    {
      targetDigimon: 'jumbogamemon',
      conditions: (digimon: Digimon) => digimon.level >= 50 && digimon.shield >= 200 && digimon.deck.some(card => card.name === 'MEGA_HYDRO_LASER')
    }
  ]
};

export function checkDigivolutionConditions(digimon: Digimon): string | null {
  const possibleDigivolutions = digivolutionConditions[digimon.name];
  if (!possibleDigivolutions) return null;

  for (const digvolution of possibleDigivolutions) {
    if (digvolution.conditions(digimon)) {
      return digvolution.targetDigimon;
    }
  }

  return null;
}