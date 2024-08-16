import { DigimonTemplate, Digimon, Card, DigimonType, BattleState } from '../shared/types';

const digimonTemplates: Record<string, DigimonTemplate> = {
  Agumon: {
    name: 'agumon',
    displayName: 'Agumon',
    type: 'DATA',
    baseHp: 50,
    specialAbility: {
      name: 'Pepper Breath',
      cost: 2,
      effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
        console.log(`${attacker.name} uses Pepper Breath on ${defender.name}`);
      },
      description: 'Deal 10 damage to the enemy.'
    }
  },
  Gabumon: {
    name: 'gabumon',
    displayName: 'Gabumon',
    type: 'VACCINE',
    baseHp: 45,
    specialAbility: {
      name: 'Blue Blaster',
      cost: 2,
      effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
        console.log(`${attacker.name} uses Blue Blaster on ${defender.name}`);
      },
      description: 'Deal 8 damage to the enemy and gain 3 block.'
    }
  },
  Impmon: {
    name: 'impmon',
    displayName: 'Impmon',
    type: 'VIRUS',
    baseHp: 40,
    specialAbility: {
      name: 'Bada Boom',
      cost: 1,
      effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
        console.log(`${attacker.name} uses Bada Boom on ${defender.name}`);
      },
      description: 'Deal 6 damage to the enemy and draw a card.'
    }
  }
};

const createBasicDeck = (digimonName: string): Card[] => [
  { id: 1, name: 'Attack', type: 'attack', damage: 6, cost: 1 },
  { id: 2, name: 'Block', type: 'block', block: 5, cost: 1 },
  { id: 3, name: digimonTemplates[digimonName].specialAbility.name, type: 'special', cost: 2 },
  ...Array(3).fill({ id: 4, name: 'Attack', type: 'attack', damage: 6, cost: 1 }),
  ...Array(3).fill({ id: 5, name: 'Block', type: 'block', block: 5, cost: 1 }),
];

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
    DATA: { DATA: 1, VACCINE: 0.5, VIRUS: 2 },
    VACCINE: { DATA: 2, VACCINE: 1, VIRUS: 0.5 },
    VIRUS: { DATA: 0.5, VACCINE: 2, VIRUS: 1 }
  };
  return relationships[attackerType][defenderType];
};