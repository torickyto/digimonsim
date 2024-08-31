import { Digimon, DigimonTemplate, DigimonState, Card } from '../shared/types';
import { getStarterDeck, getCardById } from './cardCollection';
import { DAMAGE_MULTIPLIERS } from '../game/gameConstants';
import { v4 as uuidv4 } from 'uuid';
import { calculateExpRequirement } from '../game/expSystem';
import { calculateBaseStat } from '../shared/statCalculations';




export function createDigimon(template: DigimonTemplate, level: number = 1): Digimon {
  const digimonState: DigimonState = {
    id: uuidv4(),
    name: template.name,
    displayName: template.displayName,
    type: template.type,
    digivolutionStage: template.digivolutionStage,
    level,
    exp: 0,
    
    hp: calculateBaseStat(template.baseHp, level),
    maxHp: calculateBaseStat(template.baseHp, level),
    attack: calculateBaseStat(template.baseAttack, level),
    healing: calculateBaseStat(template.baseHealing, level),
    
    evasion: template.baseEvadeChance,
    critChance: template.baseCritChance,
    accuracy: template.baseAccuracy,
    
    corruptionResistance: template.baseCorruptionResistance,
    buggedResistance: template.baseBuggedResistance,
    
    shield: 0,
    statusEffects: [],
    
    passiveSkill: template.passiveSkill,
    nickname: undefined, 
    dateObtained: new Date()  
  };

  const digimon: Digimon = {
    ...digimonState,
    expToNextLevel: calculateExpRequirement(level),
    deck: [
      { ...template.startingCard, instanceId: uuidv4(), ownerDigimonIndex: 0 },
      ...getStarterDeck(template.name).map(card => ({ ...card, ownerDigimonIndex: 0 }))
    ]
  };

  return digimon;
}

export const addCardToDigimon = (digimon: Digimon, cardId: string): Digimon => {
  const newCard = getCardById(cardId);
  if (!newCard) return digimon;
  
  return {
    ...digimon,
    deck: [...digimon.deck, { ...newCard, instanceId: uuidv4(), ownerDigimonIndex: 0 }]
  };
};

export const upgradeDigimonCard = (digimon: Digimon, cardInstanceId: string, upgrades: Partial<Card>): Digimon => {
  const updatedDeck = digimon.deck.map(card => 
    card.instanceId === cardInstanceId ? { ...card, ...upgrades } : card
  );
  return { ...digimon, deck: updatedDeck };
};
