import { Digimon, CardType, SpecialAbility } from './types';

let nextCardId = 1;

const createCard = (name: string, type: 'attack' | 'block' | 'special', cost: number, description: string, damage?: number, block?: number, effect?: SpecialAbility['effect']): CardType => {
  return {
    id: nextCardId++,
    name,
    type,
    cost,
    description,
    damage,
    block,
    effect
  };
};

export const initializeDigimonDeck = (digimon: Digimon): CardType[] => {
  return [
    createCard('Attack', 'attack', 1, 'Deal 6 damage to the target.', 6),
    createCard('Attack', 'attack', 1, 'Deal 6 damage to the target.', 6),
    createCard('Block', 'block', 1, 'Gain 5 block.', undefined, 5),
    createCard('Block', 'block', 1, 'Gain 5 block.', undefined, 5),
    createCard(digimon.specialAbility.name, 'special', digimon.specialAbility.cost, digimon.specialAbility.description, undefined, undefined, digimon.specialAbility.effect)
  ];
};

export const createDigimon = (name: string, type: 'DATA' | 'VACCINE' | 'VIRUS', baseHp: number, specialAbility: SpecialAbility): Digimon => {
  const digimon: Digimon = {
    id: Date.now(),
    name,
    displayName: name,
    type,
    hp: baseHp,
    maxHp: baseHp,
    block: 0,
    level: 1,
    exp: 0,
    baseHp,
    specialAbility,
    deck: []
  };
  digimon.deck = initializeDigimonDeck(digimon);
  return digimon;
};

export const addCardToDigimon = (digimon: Digimon, card: CardType): Digimon => {
  return {
    ...digimon,
    deck: [...digimon.deck, card]
  };
};

export const upgradeDigimonCard = (digimon: Digimon, cardId: number, upgrades: Partial<CardType>): Digimon => {
  const updatedDeck = digimon.deck.map(card => 
    card.id === cardId ? { ...card, ...upgrades } : card
  );
  return { ...digimon, deck: updatedDeck };
};

export const levelUpDigimon = (digimon: Digimon): Digimon => {
  return {
    ...digimon,
    level: digimon.level + 1,
    maxHp: digimon.maxHp + 5,
    hp: digimon.maxHp + 5,  // Heal to full HP on level up
    exp: digimon.exp - 100  // Assuming 100 exp per level
  };
};