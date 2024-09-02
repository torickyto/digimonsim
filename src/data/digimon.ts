/**
 * This file manages the creation of unique Digimon instances and provides
 * utility functions for Digimon-related operations in the game.
 * It works in conjunction with DigimonTemplate.ts to create and manage Digimon.
 */

import { Digimon, Card, DigimonType, GameState, StatusEffect } from '../shared/types';
import { getStarterDeck } from '../shared/cardCollection';
import { calculateBaseStat } from '../shared/statCalculations';
import { DigimonTemplates, getDigimonTemplate, getAllDigimonTemplates } from './DigimonTemplate';
import { BASE_EXP_REQUIREMENT, EXP_SCALE_FACTOR, MAX_LEVEL, DAMAGE_MULTIPLIERS } from '../game/gameConstants';
import { v4 as uuidv4 } from 'uuid';
import { calculateExpRequirement } from '../game/expSystem';

export const createUniqueDigimon = (templateName: string, level: number = 1): Digimon => {
  const template = getDigimonTemplate(templateName);
  if (!template) throw new Error(`No template found for ${templateName}`);

  const digimon: Digimon = {
    id: uuidv4(),
    ...template,
    level,
    digivolutionStage: template.digivolutionStage,
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
    exp: 0,
    expToNextLevel: calculateExpRequirement(level),
    deck: getStarterDeck(templateName),
    nickname: undefined,
    dateObtained: new Date()
  };

  return digimon;
};

export const gainExperience = (digimon: Digimon, expGained: number): Digimon => {
  console.log(`digimon.ts: gainExperience called for ${digimon.displayName}, gaining ${expGained} exp`);
  console.trace();
  if (expGained <= 0) {
    console.warn(`digimon.ts: Attempted to add ${expGained} experience to ${digimon.displayName}. Ignoring.`);
    return digimon;
  }

  let updatedDigimon = { ...digimon };
  updatedDigimon.exp += expGained;

  console.log(`digimon.ts: ${updatedDigimon.displayName} - Current exp: ${updatedDigimon.exp}, Required for next level: ${updatedDigimon.expToNextLevel}`);

  if (updatedDigimon.exp >= updatedDigimon.expToNextLevel) {
    console.log(`digimon.ts: ${updatedDigimon.displayName} has enough exp to level up!`);
  }

  while (updatedDigimon.level < MAX_LEVEL && updatedDigimon.exp >= updatedDigimon.expToNextLevel) {
    console.log(`digimon.ts: ${updatedDigimon.displayName} is leveling up from ${updatedDigimon.level} to ${updatedDigimon.level + 1}`);
    updatedDigimon = levelUpDigimon(updatedDigimon);
    console.log(`digimon.ts: New level: ${updatedDigimon.level}, New exp to next level: ${updatedDigimon.expToNextLevel}`);
  }

  return updatedDigimon;
};
export const getAllDigimon = (): Digimon[] => 
  getAllDigimonTemplates().map(name => createUniqueDigimon(name));

export const getDigimonById = (id: string): Digimon | undefined => {
  const allDigimon = getAllDigimon();
  return allDigimon.find(digimon => digimon.id === id);
};

export const getTypeRelationship = (attackerType: DigimonType, defenderType: DigimonType): number => {
  const relationships: Record<DigimonType, Record<DigimonType, number>> = {
    DATA: { DATA: 1, VACCINE: 0.75, VIRUS: 1.25, FREE: 1 },
    VACCINE: { DATA: 1.25, VACCINE: 1, VIRUS: 0.75, FREE: 1 },
    VIRUS: { DATA: 0.75, VACCINE: 1.25, VIRUS: 1, FREE: 1 },
    FREE: { DATA: 1, VACCINE: 1, VIRUS: 1, FREE: 1 }
  };
  return relationships[attackerType][defenderType];
};

export const addCardToDigimon = (digimon: Digimon, cardId: string): Digimon => {
  const newCard = getStarterDeck(digimon.name).find(card => card.id === cardId);
  if (!newCard) return digimon;
  
  return {
    ...digimon,
    deck: [...digimon.deck, newCard]
  };
};

export const upgradeDigimonCard = (digimon: Digimon, cardId: string, upgrades: Partial<Card>): Digimon => ({
  ...digimon,
  deck: digimon.deck.map(card => 
    card.id === cardId ? { ...card, ...upgrades } : card
  )
});

export const levelUpDigimon = (digimon: Digimon): Digimon => {
  const newLevel = digimon.level + 1;
  console.log(`Leveling up ${digimon.displayName} to level ${newLevel}`);

  const updatedDigimon: Digimon = {
    ...digimon,
    level: newLevel,
    maxHp: calculateBaseStat(digimon.maxHp, newLevel),
    hp: calculateBaseStat(digimon.maxHp, newLevel), // Fully heal on level up
    attack: calculateBaseStat(digimon.attack, newLevel),
    healing: calculateBaseStat(digimon.healing, newLevel),
    exp: digimon.exp - digimon.expToNextLevel, // Carry over excess exp
    expToNextLevel: calculateExpRequirement(newLevel),
  };

  console.log(`Updated stats for ${updatedDigimon.displayName}:`, {
    level: updatedDigimon.level,
    maxHp: updatedDigimon.maxHp,
    attack: updatedDigimon.attack,
    healing: updatedDigimon.healing,
    exp: updatedDigimon.exp,
    expToNextLevel: updatedDigimon.expToNextLevel,
  });

  return updatedDigimon;
};
export const applyPassiveSkill = (gameState: GameState, digimon: Digimon): GameState => {
  if (digimon.passiveSkill) {
    return digimon.passiveSkill.effect(gameState, digimon);
  }
  return gameState;
};

export const calculateDamage = (attacker: Digimon, defender: Digimon, baseDamage: number): number => {
  const typeMultiplier = getTypeRelationship(attacker.type, defender.type);
  const critMultiplier = Math.random() < attacker.critChance ? DAMAGE_MULTIPLIERS.CRITICAL_HIT : 1;
  const damage = baseDamage * typeMultiplier * critMultiplier;
  return Math.round(damage);
};

export const takeDamage = (digimon: Digimon, damage: number): Digimon => {
  const newHp = Math.max(0, digimon.hp - damage);
  return { ...digimon, hp: newHp };
};

export const heal = (digimon: Digimon, amount: number): Digimon => {
  const newHp = Math.min(digimon.maxHp, digimon.hp + amount);
  return { ...digimon, hp: newHp };
};

export const addShield = (digimon: Digimon, amount: number): Digimon => {
  return { ...digimon, shield: digimon.shield + amount };
};

export const removeShield = (digimon: Digimon, amount: number): Digimon => {
  const newShield = Math.max(0, digimon.shield - amount);
  return { ...digimon, shield: newShield };
};

export const addStatusEffect = (digimon: Digimon, effect: StatusEffect): Digimon => {
  return {
    ...digimon,
    statusEffects: [...digimon.statusEffects, effect]
  };
};

export const removeStatusEffect = (digimon: Digimon, effectType: string): Digimon => {
  return {
    ...digimon,
    statusEffects: digimon.statusEffects.filter(effect => effect.type !== effectType)
  };
};

export const updateStatusEffects = (digimon: Digimon): Digimon => {
  const updatedEffects = digimon.statusEffects
    .map(effect => ({ ...effect, duration: effect.duration - 1 }))
    .filter(effect => effect.duration > 0);

  return { ...digimon, statusEffects: updatedEffects };
};

export const isDigimonDefeated = (digimon: Digimon): boolean => {
  return digimon.hp <= 0;
};