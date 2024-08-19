/**
 * This file manages the creation of unique Digimon instances and provides
 * utility functions for Digimon-related operations in the game.
 * It works in conjunction with DigimonTemplate.ts to create and manage Digimon.
 */

import { Digimon, Card, DigimonType, GameState, StatusEffect } from '../shared/types';
import { getStarterDeck } from '../shared/cardCollection';
import { calculateBaseStat } from '../shared/statCalculations';
import { DigimonTemplates, getDigimonTemplate, getAllDigimonTemplates } from './DigimonTemplate';
import { EXPERIENCE_PER_LEVEL, DAMAGE_MULTIPLIERS } from '../game/gameConstants';

export const createUniqueDigimon = (templateName: string, level: number = 1): Digimon => {
  const template = getDigimonTemplate(templateName);
  if (!template) throw new Error(`No template found for ${templateName}`);

  const digimon: Digimon = {
    id: Date.now(),
    ...template,
    level,
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
    deck: getStarterDeck(templateName)
  };

  return digimon;
};

export const getAllDigimon = (): Digimon[] => 
  getAllDigimonTemplates().map(name => createUniqueDigimon(name));

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
  const template = getDigimonTemplate(digimon.name);
  if (!template) throw new Error(`No template found for ${digimon.name}`);

  const newLevel = digimon.level + 1;
  return {
    ...digimon,
    level: newLevel,
    maxHp: calculateBaseStat(template.baseHp, newLevel),
    hp: calculateBaseStat(template.baseHp, newLevel), // Heal to full HP on level up
    attack: calculateBaseStat(template.baseAttack, newLevel),
    healing: calculateBaseStat(template.baseHealing, newLevel),
    exp: digimon.exp - 100 // Assuming 100 exp per level
  };
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

export const gainExperience = (digimon: Digimon, amount: number): Digimon => {
  const newExp = digimon.exp + amount;
  if (newExp >= EXPERIENCE_PER_LEVEL) {
    return levelUpDigimon({ ...digimon, exp: newExp });
  }
  return { ...digimon, exp: newExp };
};