import { CardType, Digimon, BattleState } from './types';

export const CardCollection: Record<string, CardType> = {
  // Basic cards
  ATTACK_BASIC: {
    id: 'ATTACK_BASIC',
    name: 'Attack',
    type: 'attack',
    cost: 1,
    description: 'Deal 6 damage to the target.',
    damage: 6
  },
  BLOCK_BASIC: {
    id: 'BLOCK_BASIC',
    name: 'Block',
    type: 'block',
    cost: 1,
    description: 'Gain 5 block.',
    block: 5
  },

  // Impmon cards
  BADA_BOOM: {
    id: 'BADA_BOOM',
    name: 'Bada Boom',
    type: 'special',
    cost: 1,
    description: 'Deal 6 damage and draw 1 card.',
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damageEnemy(6);
      battleState.drawCard(1);
    }
  },
  INFERNAL_FUNNEL: {
    id: 'INFERNAL_FUNNEL',
    name: 'Infernal Funnel',
    type: 'special',
    cost: 0,
    description: 'Discard 1 card and gain 2 energy.',
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.discardCard(1);
      battleState.setPlayerEnergy(battleState.playerEnergy + 2);
    }
  },
  RIDICULE: {
    id: 'RIDICULE',
    name: 'Ridicule',
    type: 'special',
    cost: 0,
    description: "Remove the target's block and draw 1 card.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.setEnemyBlock(0);
      battleState.drawCard(1);
    }
  },

  // Add more cards here...
};

export const getCardById = (id: string): CardType | undefined => {
  return CardCollection[id];
};

export const getStarterDeck = (digimonName: string): CardType[] => {
  const basicDeck = [
    CardCollection.ATTACK_BASIC,
    CardCollection.ATTACK_BASIC,
    CardCollection.BLOCK_BASIC,
    CardCollection.BLOCK_BASIC,
  ];

  switch (digimonName.toLowerCase()) {
    case 'impmon':
      return [...basicDeck, CardCollection.BADA_BOOM];
    // Add cases for other Digimon here
    default:
      return basicDeck;
  }
};