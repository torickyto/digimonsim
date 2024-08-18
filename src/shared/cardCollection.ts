import { CardType, Digimon, BattleState, CardInstance, DigimonType } from './types';

export const CardCollection: Record<string, CardType> = {
  // Basic cards
  ATTACK_BASIC: {
    id: 'ATTACK_BASIC',
    name: 'Attack',
    type: 'attack',
    cost: 1,
    description: 'Deal 6 damage to the target.',
    damage: 6,
    digimonType: 'NULL',
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damageEnemy(6);
    }
  },
  BLOCK_BASIC: {
    id: 'BLOCK_BASIC',
    name: 'Block',
    type: 'block',
    cost: 1,
    description: 'Gain 5 shield.',
    block: 5,
    digimonType: 'NULL',
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.addPlayerBlock(5);
    }
  },

  // Impmon 
  BADA_BOOM: {
    id: 'BADA_BOOM',
    name: 'Bada Boom',
    type: 'attack',
    cost: 1,
    description: 'Deal 6 damage and draw 1 card.',
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damageEnemy(6);
      battleState.drawCard(1);
    },
    digimonType: 'VIRUS'
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
    },
    digimonType: 'VIRUS'
  },
  RIDICULE: {
    id: 'RIDICULE',
    name: 'Ridicule',
    type: 'special',
    cost: 0,
    description: "Remove the target's shield and draw 1 card.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.setEnemyBlock(0);
      battleState.drawCard(1);
    },
    digimonType: 'VIRUS'
  },

  // Agumon
  PEPPER_BREATH: {
    id: 'PEPPER_BREATH',
    name: 'Pepper Breath',
    type: 'attack',
    cost: 2,
    description: "Deal 10 damage to an enemy.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
        battleState.damageEnemy(10);
    },
    digimonType: 'DATA'
  },
  SPITFIRE: {
    id: 'SPITFIRE',
    name: 'Spit Fire',
    type: 'attack',
    cost: 3,
    description: "Deal 17 damage to a random enemy.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
        battleState.damageEnemy(17);
    },
    digimonType: 'DATA'
  },
  BABY_BURNER: {
    id: 'BABY_BURNER',
    name: 'Baby Burner',
    type: 'attack',
    cost: 5,
    description: "Deal 18 damage to all enemies.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
        battleState.damageEnemy(23);
    },
    digimonType: 'DATA'
  },
  BLUE_BLASTER: {
    id: 'BLUE_BLASTER',
    name: 'Blue Blaster',
    type: 'attack',
    cost: 2,
    description: "Deal 8 damage to the enemy and gain 3 shield.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
        battleState.damageEnemy(8);
    },
    digimonType: 'VACCINE'
  },
  SKULL_CRACKER: {
    id: 'SKULL_CRACKER',
    name: 'Skull Cracker',
    type: 'attack',
    cost: 2,
    description: "Can only target enemies with shield. Deal 20 damage.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      if (battleState.enemyBlock > 0) {
        battleState.damageEnemy(20);
      }
    },
    digimonType: 'VACCINE'
  },

  BLUE_CYCLONE: {
    id: 'BLUE_CYCLONE',
    name: 'Blue Cyclone',
    type: 'attack',
    cost: 4,
    description: "Deal 11 damage to all enemies. Each enemy hit gives the user 4 shield",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damageEnemy(11);
      battleState.addPlayerBlock(4);
    },
    digimonType: 'VACCINE'
  },

  MAGICAL_GAME: {
    id: 'MAGICAL_GAME',
    name: 'Magical Game',
    type: 'special',
    cost: 1,
    description: "Select a card to discard then gain its energy.",
    requiresCardSelection: true,
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState, selectedCard?: CardInstance) => {
      if (selectedCard) {
        battleState.discardSpecificCard(selectedCard);
        battleState.setPlayerEnergy(battleState.playerEnergy + selectedCard.cost);
      }
    },
    digimonType: 'VACCINE'
  },

  THUNDER_BOMB: {
    id: 'THUNDER_BOMB',
    name: 'Thunder Bomb',
    type: 'special',
    cost: 4,
    description: "Draw up to 3 cards then deal their combined cost * 2 to all enemies",
    requiresTarget: false,
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      const drawnCards = battleState.drawCard(3);
      const totalCost = drawnCards.reduce((sum, card) => sum + card.cost, 0);
      const damage = totalCost * 2;
      battleState.damageEnemy(damage);
    },
    digimonType: 'VACCINE'
  },

  VISIONS_OF_TERROR: {
    id: 'VISIONS_OF_TERROR',
    name: 'Visions of Terror',
    type: 'special',
    cost: 1,
    description: "Discard your hand, then draw 3 cards.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.discardHand();
      battleState.drawCard(3);
    },
    digimonType: 'VACCINE'
  },

  BLOODTHIRST: {
    id: 'BLOODTHIRST',
    name: 'Bloodthirst',
    type: 'attack',
    cost: 1,
    description: "Deal 26 damage to an ally and gain 5 energy.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damagePlayer(26);
      battleState.setPlayerEnergy(battleState.playerEnergy + 5);
    },
    digimonType: 'VIRUS'
  },

  RAVAGE: {
    id: 'RAVAGE',
    name: 'Ravage',
    type: 'attack',
    cost: 6,
    description: "Deal 26 damage to an enemy and gain 2 energy.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damageEnemy(26);
      battleState.setPlayerEnergy(battleState.playerEnergy + 2);
    },
    digimonType: 'VIRUS'
  },

  DARK_MIND: {
    id: 'DARK_MIND',
    name: 'Dark Mind',
    type: 'special',
    cost: 5,
    description: "Lose 10 health, gain 10 energy.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damagePlayer(10);
      battleState.setPlayerEnergy(battleState.playerEnergy + 10);
    },
    digimonType: 'VIRUS'
  },

  DJ_SHOOTER: {
    id: 'DJ_SHOOTER',
    name: 'DJ Shooter',
    type: 'block',
    cost: 2,
    description: "Give an ally 8 shield.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.addPlayerBlock(8);
    },
    digimonType: 'DATA'
  },

  BREAK_IT_DOWN: {
    id: 'BREAK_IT_DOWN',
    name: 'Break It Down',
    type: 'block',
    cost: 1,
    description: "Give both an ally and an enemy 10 shield.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.addPlayerBlock(10);
      battleState.addEnemyBlock(10);
    },
    digimonType: 'DATA'
  },

  MEGATON_HYDRO_LASER: {
    id: 'MEGATON_HYDRO_LASER',
    name: 'Megaton Hydro Laser',
    type: 'attack',
    cost: 8,
    description: "Deal user's shield * 10 to an enemy.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      const damage = attacker.block * 10;
      battleState.damageEnemy(damage);
    },
    digimonType: 'DATA'
  },

  JUMBO_CRATER: {
    id: 'JUMBO_CRATER',
    name: 'Jumbo Crater',
    type: 'attack',
    cost: 4,
    description: "Deal your current shield * 3 to all enemies.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      const damage = attacker.block * 3;
      battleState.damageEnemy(damage);
    },
    digimonType: 'DATA'
  },

  HEART_CRASH: {
    id: 'HEART_CRASH',
    name: 'Heart Crash',
    type: 'special',
    cost: 6,
    description: "Discard up to 6 cards, then draw up to 6 cards. Gain 1 energy for each card discarded.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      const discardedCards = battleState.discardCard(6);
      battleState.drawCard(6);
      const energyGain = discardedCards.length;
      battleState.setPlayerEnergy(battleState.playerEnergy + energyGain);
    },
    digimonType: 'VIRUS'
  },

  CORONA_DESTROYER: {
    id: 'CORONA_DESTROYER',
    name: 'Corona Destroyer',
    type: 'special',
    cost: 6,
    description: "Deal 6 damage * number of cards discarded this battle to random enemies.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      const discardedCardCount = battleState.getDiscardedCardCount();
      const damage = 6 * discardedCardCount;
      battleState.damageRandomEnemy(damage);
    },
    digimonType: 'VIRUS'
  },


  BEREJENA: {
    id: 'BEREJENA',
    name: 'Berejena',
    type: 'special',
    cost: 3,
    description: "Discard 2 random cards, gain their energy cost. Can overload.",
    requiresTarget: false,
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      const discardedCards = battleState.discardRandomCards(2);
      const energyGain = discardedCards.reduce((sum, card) => sum + card.cost, 0);
      battleState.setPlayerEnergy(battleState.playerEnergy + energyGain);
    },
    digimonType: 'VIRUS'
  },

  DEATH_CLAW: {
    id: 'DEATH_CLAW',
    name: 'Death Claw',
    type: 'attack',
    cost: 6,
    description: "Lose 13 health and deal 48 damage to an enemy. Gain 1 energy.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.damagePlayer(13);
      battleState.damageEnemy(48);
      battleState.setPlayerEnergy(battleState.playerEnergy + 1);
    },
    digimonType: 'VIRUS'
  },
  
  HEAT_VIPER: {
    id: 'HEAT_VIPER',
    name: 'Heat Viper',
    type: 'attack',
    cost: 10,
    description: "Discard 3 random cards, heal a random ally by 16, give a random ally 16 shield, and deal 16 damage to a random enemy 6 times.",
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      battleState.discardRandomCards(3);
      battleState.healRandomAlly(16);
      battleState.addRandomAllyBlock(16);
      for (let i = 0; i < 6; i++) {
        battleState.damageRandomEnemy(16);
      }
    },
    digimonType: 'VIRUS'
  }
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
    return basicDeck;
};