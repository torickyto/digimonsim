import { Digimon, Card } from '../shared/types';
import { DigivolutionConnection } from '../components/DigivolutionWeb';

interface DigivolutionCondition {
  targetDigimon: string;
  conditions: (digimon: Digimon) => boolean;
}

export const digivolutionConditions: Record<string, DigivolutionCondition[]> = {
  'koromon': [
    {
      targetDigimon: 'agumon',
      conditions: (digimon: Digimon) => digimon.level >= 3 && digimon.attack >= 15
    },
    {
      targetDigimon: 'kamemon',
      conditions: (digimon: Digimon) => digimon.level >= 3 && digimon.maxHp >= 80
    }
  ],
  'agumon': [
    {
      targetDigimon: 'greymon',
      conditions: (digimon: Digimon) => 
        digimon.level >= 10 && 
        digimon.attack >= 30 && 
        digimon.deck.some(card => card.name === "Mega Flame")
    }
  ],
  'impmon': [
    {
      targetDigimon: 'devimon',
      conditions: (digimon: Digimon) => 
        digimon.deck.some(card => card.id === 'HELL_CONTRACT')
    }
  ],
  // Add more digivolution conditions for other Digimon here
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