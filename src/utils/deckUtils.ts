// src/utils/deckUtils.ts
import { Digimon, CardType, AttackCard, BlockCard, SpecialCard } from '../shared/types';

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
        id: deck.length + 1,
        name: 'Attack',
        type: 'attack',
        cost: 1,
        damage: 6
      };
      deck.push(attackCard);
    }

    // Add 3 basic block cards for each Digimon
    for (let i = 0; i < 3; i++) {
      const blockCard: BlockCard = {
        id: deck.length + 1,
        name: 'Block',
        type: 'block',
        cost: 1,
        block: 5
      };
      deck.push(blockCard);
    }

    // Add the Digimon's special ability card
    const specialCard: SpecialCard = {
      id: deck.length + 1,
      name: digimon.specialAbility.name,
      type: 'special',
      cost: digimon.specialAbility.cost,
      effect: digimon.specialAbility.effect
    };
    deck.push(specialCard);
  });

  return shuffleArray(deck);
};