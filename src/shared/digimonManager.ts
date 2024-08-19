import { Digimon, DigimonTemplate, DigimonState, Card } from '../shared/types';
import { getStarterDeck, getCardById } from './cardCollection';
import { DAMAGE_MULTIPLIERS } from '../game/gameConstants';

export function createDigimon(template: DigimonTemplate, level: number = 1): Digimon {
  const digimonState: DigimonState = {
    id: Date.now(),
    name: template.name,
    displayName: template.displayName,
    type: template.type,
    level,
    exp: 0,
    
    hp: calculateStat(template.baseHp, level),
    maxHp: calculateStat(template.baseHp, level),
    attack: calculateStat(template.baseAttack, level),
    healing: calculateStat(template.baseHealing, level),
    
    evasion: template.baseEvadeChance,
    critChance: template.baseCritChance,
    accuracy: template.baseAccuracy,
    
    corruptionResistance: template.baseCorruptionResistance,
    buggedResistance: template.baseBuggedResistance,
    
    shield: 0,
    statusEffects: [],
    
    passiveSkill: template.passiveSkill
  };

  const digimon: Digimon = {
    ...digimonState,
    deck: [template.startingCard, ...getStarterDeck(template.name)]
  };

  return digimon;
}

function calculateStat(baseStat: number, level: number): number {
  // simple linear scaling placeholder
  return Math.round(baseStat * (1 + (level - 1) * 0.1));
}

export const addCardToDigimon = (digimon: Digimon, cardId: string): Digimon => {
  const newCard = getCardById(cardId);
  if (!newCard) return digimon;
  
  return {
    ...digimon,
    deck: [...digimon.deck, newCard]
  };
};

export const upgradeDigimonCard = (digimon: Digimon, cardId: string, upgrades: Partial<Card>): Digimon => {
  const updatedDeck = digimon.deck.map(card => 
    card.id === cardId ? { ...card, ...upgrades } : card
  );
  return { ...digimon, deck: updatedDeck };
};

export const levelUpDigimon = (digimon: Digimon): Digimon => {
  return {
    ...digimon,
    level: digimon.level + 1,
    maxHp: calculateStat(digimon.maxHp, digimon.level + 1),
    hp: calculateStat(digimon.maxHp, digimon.level + 1),  // heal on level up
    attack: calculateStat(digimon.attack, digimon.level + 1),
    healing: calculateStat(digimon.healing, digimon.level + 1),
    exp: digimon.exp - 100  // placeholder - 100 exp per level
  };
};