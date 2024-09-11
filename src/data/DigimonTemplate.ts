/**
 * This file defines the base templates for all Digimon in the game.
 * It serves as the single source of truth for Digimon base stats and properties.
 */

import { DigimonTemplate, DigimonType, PassiveSkill, DigivolutionStage } from '../shared/types';
import { CardCollection } from '../shared/cardCollection';

const nullPassiveSkill: PassiveSkill = {
  name: "No Passive",
  description: "This Digimon has no passive skill.",
  effect: (state, digimon) => state // No effect
};


export const DigimonTemplates: Record<string, DigimonTemplate> = {
  koromon: {
    name: 'koromon',
    displayName: 'Koromon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 35,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  tsunomon: {
    name: 'tsunomon',
    displayName: 'Tsunomon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 35,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  pagumon: {
    name: 'pagumon',
    displayName: 'Pagumon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 33,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  budmon: {
    name: 'budmon',
    displayName: 'Budmon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 35,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  tokomon: {
    name: 'tokomon',
    displayName: 'Tokomon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 35,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  minomon: {
    name: 'minomon',
    displayName: 'Minomon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 35,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  gummymon: {
    name: 'gummymon',
    displayName: 'Gummymon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 35,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  tsumemon: {
    name: 'tsumemon',
    displayName: 'Tsumemon',
    type: 'FREE' as DigimonType,
    digivolutionStage: 'In-Training' as DigivolutionStage,
    baseHp: 35,
    baseAttack: 4,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  agumon: {
    name: 'agumon',
    displayName: 'Agumon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 50,
    baseAttack: 8,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  veemon: {
    name: 'veemon',
    displayName: 'Veemon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 50,
    baseAttack: 8,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  guilmon: {
    name: 'guilmon',
    displayName: 'Guilmon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 50,
    baseAttack: 8,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  gabumon: {
    name: 'gabumon',
    displayName: 'Gabumon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 55,
    baseAttack: 7,
    baseHealing: 5,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 0.9,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.BLUE_BLASTER,
    passiveSkill: nullPassiveSkill
  },
  monodramon: {
    name: 'monodramon',
    displayName: 'Monodramon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 50,
    baseAttack: 8,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  impmon: {
    name: 'impmon',
    displayName: 'Impmon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 42,
    baseAttack: 6,
    baseHealing: 5,
    baseEvadeChance: 0.07,
    baseCritChance: 0.07,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.25,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.BADA_BOOM,
    passiveSkill: nullPassiveSkill
  },
  patamon: {
    name: 'patamon',
    displayName: 'Patamon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 40,
    baseAttack: 5,
    baseHealing: 8,
    baseEvadeChance: 0.07,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.BOOM_BUBBLE,
    passiveSkill: nullPassiveSkill
  },
  tentomon: {
    name: 'tentomon',
    displayName: 'Tentomon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 47,
    baseAttack: 7,
    baseHealing: 3,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.SUPER_SHOCKER,
    passiveSkill: nullPassiveSkill
  },
  goblimon: {
    name: 'goblimon',
    displayName: 'Goblimon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 53,
    baseAttack: 8,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: .9,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.1,
    startingCard: CardCollection.GOBLIN_STRIKE,
    passiveSkill: nullPassiveSkill
  },
  mushmon: {
    name: 'mushmon',
    displayName: 'Mushmon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 50,
    baseAttack: 8,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  kunemon: {
    name: 'kunemon',
    displayName: 'Kunemon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 50,
    baseAttack: 8,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  keramon: {
    name: 'keramon',
    displayName: 'Keramon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 53,
    baseAttack: 8,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: .9,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.1,
    startingCard: CardCollection.GOBLIN_STRIKE,
    passiveSkill: nullPassiveSkill
  },
  terriermon: {
    name: 'terriermon',
    displayName: 'Terriermon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 47,
    baseAttack: 6,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.BOOM_BUBBLE,
    passiveSkill: nullPassiveSkill
  },
  kamemon: {
    name: 'kamemon',
    displayName: 'Kamemon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 50,
    baseAttack: 8,
    baseHealing: 4,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.PEPPER_BREATH,
    passiveSkill: nullPassiveSkill
  },
  greymon: {
    name: 'greymon',
    displayName: 'Greymon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 73,
    baseAttack: 15,
    baseHealing: 7,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 0.95,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  garurumon: {
    name: 'garurumon',
    displayName: 'Garurumon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 70,
    baseAttack: 14,
    baseHealing: 8,
    baseEvadeChance: 0.1,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  angemon: {
    name: 'angemon',
    displayName: 'Angemon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 63,
    baseAttack: 12,
    baseHealing: 13,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.4,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  gargomon: {
    name: 'gargomon',
    displayName: 'Gargomon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 75,
    baseAttack: 12,
    baseHealing: 9,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  veggiemon: {
    name: 'veggiemon',
    displayName: 'Veggiemon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 73,
    baseAttack: 15,
    baseHealing: 7,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 0.95,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  kuwagamon: {
    name: 'kuwagamon',
    displayName: 'Kuwagamon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 73,
    baseAttack: 15,
    baseHealing: 7,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 0.95,
    baseCorruptionResistance: 0.2,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  sangloupmon: {
    name: 'sangloupmon',
    displayName: 'Sangloupmon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 65,
    baseAttack: 17,
    baseHealing: 4,
    baseEvadeChance: 0.1,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.5,
    baseBuggedResistance: 0.25,
    startingCard: CardCollection.BLOODTHIRST,
    passiveSkill: nullPassiveSkill
  },
  devimon: {
    name: 'devimon',
    displayName: 'Devimon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 70,
    baseAttack: 13,
    baseHealing: 6,
    baseEvadeChance: 0.1,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.5,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  chrysalimon: {
    name: 'chrysalimon',
    displayName: 'Chrysalimon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 70,
    baseAttack: 13,
    baseHealing: 6,
    baseEvadeChance: 0.1,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.5,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  wizardmon: {
    name: 'wizardmon',
    displayName: 'Wizardmon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 62,
    baseAttack: 12,
    baseHealing: 12,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.25,
    baseBuggedResistance: 0.5,
    startingCard: CardCollection.THUNDER_BOMB,
    passiveSkill: nullPassiveSkill
  },
  vilemon: {
    name: 'vilemon',
    displayName: 'Vilemon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 66,
    baseAttack: 14,
    baseHealing: 2,
    baseEvadeChance: 0.05,
    baseCritChance: 0.1,
    baseAccuracy: 0.9,
    baseCorruptionResistance: 0.25,
    baseBuggedResistance: 0.25,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  revolmon: {
    name: 'revolmon',
    displayName: 'Revolmon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 67,
    baseAttack: 16,
    baseHealing: 7,
    baseEvadeChance: 0.05,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.25,
    baseBuggedResistance: 0.25,
    startingCard: CardCollection.DEADLY_NAIL,
    passiveSkill: nullPassiveSkill
  },
  gawappamon: {
    name: 'gawappamon',
    displayName: 'Gawappamon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Champion' as DigivolutionStage,
    baseHp: 76,
    baseAttack: 10,
    baseHealing: 14,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 0.95,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DJ_SHOOTER,
    passiveSkill: nullPassiveSkill
  },
  metalgreymon: {
    name: 'metalgreymon',
    displayName: 'Metalgreymon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Ultimate' as DigivolutionStage,
    baseHp: 82,
    baseAttack: 24,
    baseHealing: 13,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 0.95,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DJ_SHOOTER,
    passiveSkill: nullPassiveSkill //DEAL 1.5 DAMAGE TO SHIELDS. BASE RAM VALUE + 1
  },
  skullknightmon: {
    name: 'skullknightmon',
    displayName: 'Skullknightmon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Ultimate' as DigivolutionStage,
    baseHp: 80,
    baseAttack: 23,
    baseHealing: 9,
    baseEvadeChance: 0.05,
    baseCritChance: 0.1,
    baseAccuracy: 0.95,
    baseCorruptionResistance: 1,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DJ_SHOOTER,
    passiveSkill: nullPassiveSkill //start each battle with 40 shield
  },
  shawujingmon: {
    name: 'shawujingmon',
    displayName: 'Shawujingmon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Ultimate' as DigivolutionStage,
    baseHp: 80,
    baseAttack: 23,
    baseHealing: 9,
    baseEvadeChance: 0.15,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DJ_SHOOTER,
    passiveSkill: nullPassiveSkill // DEALING DAMAGE GIVES THE USER 5 SHIELD (once per card). BASE RAM VALUE + 1
  },
  superstarmon: {
    name: 'superstarmon',
    displayName: 'Superstarmon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Ultimate' as DigivolutionStage,
    baseHp: 77,
    baseAttack: 17,
    baseHealing: 16,
    baseEvadeChance: 0.1,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.3,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DJ_SHOOTER,
    passiveSkill: nullPassiveSkill //LANDING A CRIT GIVES +1 RAM. BASE RAM VALUE + 1
  },
  matadormon: {
    name: 'matadormon',
    displayName: 'Matadormon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Ultimate' as DigivolutionStage,
    baseHp: 84,
    baseAttack: 24,
    baseHealing: 13,
    baseEvadeChance: 0.15,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.5,
    baseBuggedResistance: 0.3,
    startingCard: CardCollection.DJ_SHOOTER,
    passiveSkill: nullPassiveSkill //DODGING AN ATTACK ADDS +1 RAM TO THE START OF NEXT TURN. BASE RAM VALUE + 1
  },
  wargreymon: {
    name: 'wargreymon',
    displayName: 'Wargreymon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Mega' as DigivolutionStage,
    baseHp: 100,
    baseAttack: 35,
    baseHealing: 15,
    baseEvadeChance: 0.1,
    baseCritChance: 0.1,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.5,
    baseBuggedResistance: 0.5,
    startingCard: CardCollection.CORONA_DESTROYER,
    passiveSkill: nullPassiveSkill //DEAL X2 DAMAGE ON DIGIMON WITH DRA OR GREY IN THEIR NAME. BASE RAM VALUE + 2
  },
  beelzemon: {
    name: 'beelzemon',
    displayName: 'Beelzemon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Mega' as DigivolutionStage,
    baseHp: 96,
    baseAttack: 32,
    baseHealing: 14,
    baseEvadeChance: 0.1,
    baseCritChance: 0.15,
    baseAccuracy: 1,
    baseCorruptionResistance: 0.8,
    baseBuggedResistance: 0.5,
    startingCard: CardCollection.CORONA_DESTROYER,
    passiveSkill: nullPassiveSkill //GAIN +1 ATTACK PER DISCARDED CARD THIS BATTLE. BASE RAM VALUE + 2
  },
  jumbogamemon: {
    name: 'jumbogamemon',
    displayName: 'JumboGamemon',
    type: 'DATA' as DigimonType,
    digivolutionStage: 'Mega' as DigivolutionStage,
    baseHp: 110,
    baseAttack: 23,
    baseHealing: 12,
    baseEvadeChance: 0.05,
    baseCritChance: 0.05,
    baseAccuracy: 0.85,
    baseCorruptionResistance: 0.6,
    baseBuggedResistance: 0.6,
    startingCard: CardCollection.JUMBO_CRATER,
    passiveSkill: nullPassiveSkill //START EACH BATTLE WITH + 50 SHIELD. BASE RAM VALUE + 2
  },
  kimeramon: {
    name: 'kimeramon',
    displayName: 'Kimeramon',
    type: 'VIRUS' as DigimonType,
    digivolutionStage: 'Mega' as DigivolutionStage,
    baseHp: 118,
    baseAttack: 36,
    baseHealing: 14,
    baseEvadeChance: 0.05,
    baseCritChance: 0.1,
    baseAccuracy: 0.95,
    baseCorruptionResistance: 1,
    baseBuggedResistance: 0.2,
    startingCard: CardCollection.HEAT_VIPER,
    passiveSkill: nullPassiveSkill // CORRUPTION HEALS SELF INSTEAD OF DAMAGING. BASE RAM VALUE + 2
  },
  lucemon: {
    name: 'lucemon',
    displayName: 'Lucemon',
    type: 'VACCINE' as DigimonType,
    digivolutionStage: 'Rookie' as DigivolutionStage,
    baseHp: 666,
    baseAttack: 23,
    baseHealing: 15,
    baseEvadeChance: 0.14,
    baseCritChance: 0.09,
    baseAccuracy: 0.94,
    baseCorruptionResistance: 0.45,
    baseBuggedResistance: 0.45,
    startingCard: CardCollection.DIVINE_FEAT,
    passiveSkill: nullPassiveSkill //REVIVE ONCE PER BATTLE. BASE RAM VALUE + 3
  }
};

export const getDigimonTemplate = (name: string): DigimonTemplate | undefined => DigimonTemplates[name];

export const getAllDigimonTemplates = (): string[] => Object.keys(DigimonTemplates);