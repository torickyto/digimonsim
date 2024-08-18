import { DigimonTemplate, Digimon, CardType, DigimonType, BattleState } from '../shared/types';
import { CardCollection, getStarterDeck } from '../shared/cardCollection';

const digimonTemplates: Record<string, DigimonTemplate> = {
  Agumon: {
    name: 'agumon',
    displayName: 'Agumon',
    type: 'DATA',
    baseHp: 50,
    startingCard: CardCollection.PEPPER_BREATH
  },
  Gabumon: {
    name: 'gabumon',
    displayName: 'Gabumon',
    type: 'VACCINE',
    baseHp: 45,
    startingCard: CardCollection.BLUE_BLASTER
  },
  Impmon: {
    name: 'impmon',
    displayName: 'Impmon',
    type: 'VIRUS',
    baseHp: 40,
    startingCard: CardCollection.BADA_BOOM
  }
};
export const createUniqueDigimon = (templateName: string, level: number = 1): Digimon => {
  const template = digimonTemplates[templateName];
  if (!template) throw new Error(`No template found for ${templateName}`);

  const digimon: Digimon = {
    id: Date.now(),
    ...template,
    level,
    hp: template.baseHp + (level - 1) * 5,
    maxHp: template.baseHp + (level - 1) * 5,
    block: 0,
    exp: 0,
    deck: getStarterDeck(templateName)
  };

  return digimon;
};

export const getAllDigimonTemplates = (): string[] => Object.keys(digimonTemplates);

export const getDigimonTemplate = (name: string): DigimonTemplate | undefined => digimonTemplates[name];

export const getAllDigimon = (): Digimon[] => 
  Object.keys(digimonTemplates).map(name => createUniqueDigimon(name));

export const getDigimonById = (id: number): Digimon | undefined => {
  const allDigimon = getAllDigimon();
  return allDigimon.find(digimon => digimon.id === id);
};

export const getTypeRelationship = (attackerType: DigimonType, defenderType: DigimonType): number => {
  const relationships: Record<DigimonType, Record<DigimonType, number>> = {
    DATA: { DATA: 1, VACCINE: 0.5, VIRUS: 2, NULL: 1 },
    VACCINE: { DATA: 2, VACCINE: 1, VIRUS: 0.5, NULL: 1 },
    VIRUS: { DATA: 0.5, VACCINE: 2, VIRUS: 1, NULL: 1 },
    NULL: { DATA: 1, VACCINE: 1, VIRUS: 1, NULL: 1 }
  };
  return relationships[attackerType][defenderType];
};

export const addCardToDigimon = (digimon: Digimon, cardId: string): Digimon => {
  const newCard = CardCollection[cardId];
  if (!newCard) return digimon;
  
  return {
    ...digimon,
    deck: [...digimon.deck, newCard]
  };
};

export const upgradeDigimonCard = (digimon: Digimon, cardId: string, upgrades: Partial<CardType>): Digimon => ({
  ...digimon,
  deck: digimon.deck.map(card => 
    card.id === cardId ? { ...card, ...upgrades } : card
  )
});

export const levelUpDigimon = (digimon: Digimon): Digimon => ({
  ...digimon,
  level: digimon.level + 1,
  maxHp: digimon.maxHp + 5,
  hp: digimon.maxHp + 5,  // Heal to full HP on level up
  exp: digimon.exp - 100  // Assuming 100 exp per level
});