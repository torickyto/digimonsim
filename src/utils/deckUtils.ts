import { Digimon, CardType, AttackCard, BlockCard, SpecialCard, DigimonType  } from '../shared/types';

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const createDeck = (playerTeam: Digimon[]): CardType[] => {
  let deck: CardType[] = [];
  
  playerTeam.forEach((digimon, index) => {
    // Add 3 basic attack cards for each Digimon
    for (let i = 0; i < 3; i++) {
      const attackCard: AttackCard = {
        id: `attack_${digimon.name}_${i}`,
        name: 'Attack',
        type: 'attack',
        cost: 1,
        damage: 6,
        description: 'Deal 6 damage to the target.',
        digimonType: digimon.type
      };
      deck.push(attackCard);
    }

    // Add 3 basic block cards for each Digimon
    for (let i = 0; i < 3; i++) {
      const blockCard: BlockCard = {
        id: `block_${digimon.name}_${i}`,
        name: 'Block',
        type: 'block',
        cost: 1,
        block: 5,
        description: 'Gain 5 block.',
        digimonType: digimon.type
      };
      deck.push(blockCard);
    }

    // Add the Digimon's starting card
    deck.push(digimon.startingCard);
  });

  return shuffleArray(deck);
};