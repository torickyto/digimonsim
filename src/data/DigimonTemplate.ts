/**
 * This file defines the base templates for all Digimon in the game.
 * It serves as the single source of truth for Digimon base stats and properties.
 */

import { DigimonTemplate, DigimonType, PassiveSkill } from '../shared/types';
import { CardCollection } from '../shared/cardCollection';

const nullPassiveSkill: PassiveSkill = {
  name: "No Passive",
  description: "This Digimon has no passive skill.",
  effect: (state, digimon) => state // No effect
};


export const DigimonTemplates: Record<string, DigimonTemplate> = {
  impmon: {
    name: 'impmon',
    displayName: 'Impmon',
    type: 'VIRUS' as DigimonType,
    baseHp: 40,
    baseAttack: 6,
    baseHealing: 3,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.BADA_BOOM,
    passiveSkill: nullPassiveSkill
  },
  goblimon: {
    name: 'goblimon',
    displayName: 'Goblimon',
    type: 'VIRUS' as DigimonType,
    baseHp: 120,
    baseAttack: 6,
    baseHealing: 3,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.GOBLIN_STRIKE,
    passiveSkill: nullPassiveSkill
  },
  beelzemon: {
    name: 'beelzemon',
    displayName: 'Beelzemon',
    type: 'VIRUS' as DigimonType,
    baseHp: 80,
    baseAttack: 20,
    baseHealing: 8,
    baseEvadeChance: 0.1,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.8,
    baseBuggedResistance: 0.4,
    startingCard: CardCollection.CORONA_DESTROYER,
    passiveSkill: nullPassiveSkill
  },
  devimon: {
    name: 'devimon',
    displayName: 'Devimon',
    type: 'VIRUS' as DigimonType,
    baseHp: 70,
    baseAttack: 24,
    baseHealing: 12,
    baseEvadeChance: 0.12,
    baseCritChance: 0.08,
    baseAccuracy: 0.93,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.4,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  wizardmon: {
    name: 'wizardmon',
    displayName: 'Wizardmon',
    type: 'DATA' as DigimonType,
    baseHp: 60,
    baseAttack: 20,
    baseHealing: 12,
    baseEvadeChance: 0.12,
    baseCritChance: 0.08,
    baseAccuracy: 0.93,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.4,
    startingCard: CardCollection.THUNDER_BOMB,
    passiveSkill: nullPassiveSkill
  },
  agumon: {
    name: 'agumon',
    displayName: 'Agumon',
    type: 'VACCINE' as DigimonType,
    baseHp: 50,
    baseAttack: 18,
    baseHealing: 7,
    baseEvadeChance: 0.08,
    baseCritChance: 0.06,
    baseAccuracy: 0.92,
    baseCorruptionResistance: 0.25,
    baseBuggedResistance: 0.25,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  gawappamon: {
    name: 'gawappamon',
    displayName: 'Gawappamon',
    type: 'DATA' as DigimonType,
    baseHp: 55,
    baseAttack: 17,
    baseHealing: 10,
    baseEvadeChance: 0.11,
    baseCritChance: 0.07,
    baseAccuracy: 0.91,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.35,
    startingCard: CardCollection.DJ_SHOOTER,
    passiveSkill: nullPassiveSkill
  },
  gabumon: {
    name: 'gabumon',
    displayName: 'Gabumon',
    type: 'DATA' as DigimonType,
    baseHp: 45,
    baseAttack: 16,
    baseHealing: 6,
    baseEvadeChance: 0.09,
    baseCritChance: 0.06,
    baseAccuracy: 0.9,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.BLUE_BLASTER,
    passiveSkill: nullPassiveSkill
  },
  jumbogamemon: {
    name: 'jumbogamemon',
    displayName: 'JumboGamemon',
    type: 'DATA' as DigimonType,
    baseHp: 90,
    baseAttack: 22,
    baseHealing: 5,
    baseEvadeChance: 0.05,
    baseCritChance: 0.04,
    baseAccuracy: 0.85,
    baseCorruptionResistance: 0.4,
    baseBuggedResistance: 0.4,
    startingCard: CardCollection.JUMBO_CRATER,
    passiveSkill: nullPassiveSkill
  },
  kimeramon: {
    name: 'kimeramon',
    displayName: 'Kimeramon',
    type: 'VIRUS' as DigimonType,
    baseHp: 75,
    baseAttack: 28,
    baseHealing: 3,
    baseEvadeChance: 0.07,
    baseCritChance: 0.12,
    baseAccuracy: 0.88,
    baseCorruptionResistance: 0.5,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.HEAT_VIPER,
    passiveSkill: nullPassiveSkill
  },
  lucemon: {
    name: 'lucemon',
    displayName: 'Lucemon',
    type: 'VACCINE' as DigimonType,
    baseHp: 666,
    baseAttack: 23,
    baseHealing: 15,
    baseEvadeChance: 0.14,
    baseCritChance: 0.09,
    baseAccuracy: 0.94,
    baseCorruptionResistance: 0.45,
    baseBuggedResistance: 0.45,
    startingCard: CardCollection.DIVINE_FEAT,
    passiveSkill: nullPassiveSkill
  },
  sangloupmon: {
    name: 'sangloupmon',
    displayName: 'Sangloupmon',
    type: 'VIRUS' as DigimonType,
    baseHp: 65,
    baseAttack: 21,
    baseHealing: 8,
    baseEvadeChance: 0.13,
    baseCritChance: 0.08,
    baseAccuracy: 0.92,
    baseCorruptionResistance: 0.35,
    baseBuggedResistance: 0.25,
    startingCard: CardCollection.BLOODTHIRST,
    passiveSkill: nullPassiveSkill
  }
};

export const getDigimonTemplate = (name: string): DigimonTemplate | undefined => DigimonTemplates[name];

export const getAllDigimonTemplates = (): string[] => Object.keys(DigimonTemplates);