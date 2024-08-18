// types.ts

// Enums and basic types
export type DigimonType = 'NULL' | 'DATA' | 'VACCINE' | 'VIRUS';
export type CardEffectType = 'attack' | 'shield' | 'special';
export type TargetType = 'self' | 'enemy' | 'all_enemies' | 'random_enemy' | 'all_allies' | 'random_ally' | 'none';
export type StatusEffectType = 'counter' | 'corruption' | 'bugged' | 'rage';
export type ComboTrigger = 'attack' | 'shield' | 'special';
export type ScalingFactor = 'turnNumber' | 'cardsPlayedThisTurn' | 'damageTakenThisTurn' | 'cardsDiscardedThisTurn' | 'corruptionStacks' | 'enemyCorruptionStacks';

// Card-related interfaces
export interface CardEffect {
  damage?: number;
  shield?: number;
  heal?: number;
  drawCards?: number;
  discardCards?: number;
  gainEnergy?: number;
  removeEnemyShield?: boolean;
  removeAllShield?: boolean;
  removeAilments?: boolean;
  consumable?: boolean;
  burst?: boolean;
  recompile?: boolean;
  applyStatus?: {
    type: StatusEffectType;
    duration: number;
    value?: number;
  };
  createCards?: {
    cardId: string;
    amount: number;
    location: 'hand' | 'deck' | 'discardPile';
  };
  drawSpecificCards?: {
    amount: number;
    cost?: number;
    type?: DigimonType;
    cardType?: CardEffectType;
    destination: 'hand' | 'discardPile';
  };
  modifyCost?: {
    target: 'all' | 'specific';
    cardId?: string;
    amount: number;
    duration: number;
  };
  criticalHit?: {
    target: 'all' | 'specific';
    cardId?: string;
    multiplier: number;
    duration: number;
  };
  trueDamage?: number;
  breakShield?: boolean;
  disappearOnTurnEnd?: boolean;
  shuffleIntoDeck?: {
    cardId: string;
    amount: number;
  };
  requireEnemyShield?: boolean;
  modifyStatMultiplier?: {
    stat: 'evasion' | 'critChance' | 'critDamage';
    multiplier: number;
    duration: number;
  };
  combo?: {
    trigger: ComboTrigger;
    effect: CardEffect;
  };
  scaling?: {
    factor: ScalingFactor;
    effect: (value: number) => Partial<CardEffect>;
  };
  conditional?: {
    condition: (state: GameState) => boolean;
    effect: CardEffect;
  };
  customEffect?: (state: GameState) => void;
}

export interface Card {
  id: string;
  name: string;
  type: CardEffectType;
  cost: number;
  digimonType: DigimonType;
  description: string;
  target: TargetType;
  effects: CardEffect[];
  requiresCardSelection?: boolean;
  instanceId?: string; // For CardInstance
  createdThisTurn?: boolean;
}

// Game state interfaces
export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value?: number;
}

export interface DigimonState {
  id: number;
  name: string;
  displayName: string;
  type: DigimonType;
  hp: number;
  maxHp: number;
  shield: number;
  level: number;
  exp: number;
  statusEffects: StatusEffect[];
  evasion: number;
  critChance: number;
  critDamage: number;
}

export interface GameState {
  player: {
    energy: number;
    hand: Card[];
    deck: Card[];
    discardPile: Card[];
    digimon: DigimonState[];
  };
  enemy: {
    digimon: DigimonState[];
  };
  turn: number;
  phase: 'player' | 'enemy';
  cardsPlayedThisTurn: number;
  damageTakenThisTurn: number;
  cardsDiscardedThisTurn: number;
  lastPlayedCardType?: CardEffectType;
  temporaryEffects: {
    costModification: CardEffect['modifyCost'][];
    criticalHits: CardEffect['criticalHit'][];
    statMultipliers: CardEffect['modifyStatMultiplier'][];
  };
}

// Digimon-related interfaces

export interface PassiveSkill {
  name: string;
  description: string;
  effect: (state: GameState, digimon: DigimonState) => GameState;
}

export interface DigimonState {
  id: number;
  name: string;
  displayName: string;
  type: DigimonType;
  level: number;
  exp: number;
  
  // Base stats
  hp: number;
  maxHp: number;
  attack: number;
  healing: number;
  
  // Percentage stats (represented as decimals, e.g., 0.15 for 15%)
  evasion: number;  
  critChance: number;
  critDamage: number; 
  accuracy: number;
  
  // Resistances (represented as decimals, e.g., 0.3 for 30% resistance)
  corruptionResistance: number;
  buggedResistance: number;
  
  shield: number;
  statusEffects: StatusEffect[];
  
  // Passive skill (can be null)
  passiveSkill: PassiveSkill | null;
}

export interface DigimonTemplate {
  name: string;
  displayName: string;
  type: DigimonType;
  baseHp: number;
  baseAttack: number;
  baseHealing: number;
  baseEvadeChance: number;  
  baseCritChance: number;
  baseCritDamage: number;
  baseAccuracy: number;
  baseCorruptionResistance: number;
  baseBuggedResistance: number;
  startingCard: Card;
  passiveSkill: PassiveSkill | null;
}

export interface Digimon extends DigimonState {
  deck: Card[];
}

export interface DigimonEgg {
  id: number;
  hatchTime: number;
  possibleDigimon: string[];
}

// Battle-related interfaces
export interface BattleActions {
  drawCard: (amount: number) => void;
  setPlayerEnergy: (amount: number) => void;
  damageEnemy: (amount: number, target: number, isTrueDamage?: boolean) => void;
  damagePlayer: (amount: number, target: number, isTrueDamage?: boolean) => void;
  addPlayerShield: (amount: number, target: number) => void;
  addEnemyShield: (amount: number, target: number) => void;
  removePlayerShield: (amount: number, target: number) => void;
  removeEnemyShield: (amount: number, target: number) => void;
  removeAllShield: () => void;
  discardCard: (amount: number) => Card[];
  discardHand: () => void;
  discardRandomCards: (amount: number) => Card[];
  discardSpecificCard: (cardToDiscard: Card) => void;
  getDiscardedCardCount: () => number;
  healAlly: (amount: number, target: number) => void;
  applyStatusEffect: (effect: StatusEffect, target: 'player' | 'enemy', index: number) => void;
  removeStatusEffect: (effectType: StatusEffectType, target: 'player' | 'enemy', index: number) => void;
  removeAllAilments: (target: 'player' | 'enemy', index: number) => void;
  createCard: (cardId: string, amount: number, location: 'hand' | 'deck' | 'discardPile') => void;
  modifyCardCost: (modification: CardEffect['modifyCost']) => void;
  applyCriticalHit: (criticalHit: CardEffect['criticalHit']) => void;
  shuffleIntoDeck: (cardId: string, amount: number) => void;
  drawSpecificCards: (params: CardEffect['drawSpecificCards']) => void;
  modifyStatMultiplier: (params: CardEffect['modifyStatMultiplier']) => void;
  applyCorruption: (amount: number, target: 'player' | 'enemy', index: number) => void;
  removeCardFromGame: (card: Card) => void;
  removeCardFromBattle: (card: Card) => void;
  addCardCopy: (card: Card, destination: 'hand' | 'deck' | 'discardPile') => void;
  getScalingValue: (factor: ScalingFactor) => number;
  gainEnergy: (amount: number) => void;
  removeAilments: (target: 'player' | 'enemy', index: number) => void;
}

// Player-related interfaces
export interface Player {
  party: DigimonState[];
  eggs: DigimonEgg[];
  currentDigimon: DigimonState;
}

// Utility types
export type CardCreationFunction = (
  id: string,
  name: string,
  type: CardEffectType,
  cost: number,
  digimonType: DigimonType,
  description: string,
  target: TargetType,
  effects: CardEffect[],
  requiresCardSelection?: boolean
) => Card;

// Utility constants
export const TYPE_COLORS: Record<DigimonType, string> = {
  NULL: 'white',
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};

export const CORRUPTION_DAMAGE_PER_STACK = 5;