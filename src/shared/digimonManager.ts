import { Digimon, CardType, SpecialAbility } from './types';
import { getStarterDeck, getCardById } from './cardCollection';

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
    deck: getStarterDeck(name)
  };
  return digimon;
};

export const addCardToDigimon = (digimon: Digimon, cardId: string): Digimon => {
    const newCard = getCardById(cardId);
    if (!newCard) return digimon;
    
    return {
      ...digimon,
      deck: [...digimon.deck, newCard]
    };
  };

export const upgradeDigimonCard = (digimon: Digimon, cardId: string, upgrades: Partial<CardType>): Digimon => {
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