import { DigimonTemplate, Digimon, CardType, DigimonType, BattleState } from '../shared/types';

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

let nextCardId = 1;

const createCard = (
  name: string,
  type: 'attack' | 'block' | 'special',
  cost: number,
  description: string,
  damage?: number,
  block?: number,
  effect?: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void
): CardType => ({
  id: nextCardId++,
  name,
  type,
  cost,
  description,
  damage,
  block,
  effect
});

const createBasicDeck = (digimonName: string): CardType[] => [
  createCard('Attack', 'attack', 1, 'Deal 6 damage to the target.', 6),
  createCard('Attack', 'attack', 1, 'Deal 6 damage to the target.', 6),
  createCard('Block', 'block', 1, 'Gain 5 block.', undefined, 5),
  createCard('Block', 'block', 1, 'Gain 5 block.', undefined, 5),
  createCard(
    digimonTemplates[digimonName].specialAbility.name,
    'special',
    digimonTemplates[digimonName].specialAbility.cost,
    digimonTemplates[digimonName].specialAbility.description,
    undefined,
    undefined,
    digimonTemplates[digimonName].specialAbility.effect
  )
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
    deck: createBasicDeck(templateName)
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

export const addCardToDigimon = (digimon: Digimon, card: CardType): Digimon => ({
  ...digimon,
  deck: [...digimon.deck, card]
});

export const upgradeDigimonCard = (digimon: Digimon, cardId: number, upgrades: Partial<CardType>): Digimon => ({
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