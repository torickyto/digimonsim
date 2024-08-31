// types.ts

// Enums and basic types
export type DigimonType = 'FREE' | 'DATA' | 'VACCINE' | 'VIRUS';
export type CardEffectType = 'attack' | 'shield' | 'special' | 'healing';
export type TargetType = 'self' | 'single_ally' | 'enemy' | 'all_enemies' | 'random_enemy' | 'all_allies' | 'random_ally' | 'none'| 'all';
export type StatusEffectType = 'corruption' | 'bugged' | 'taunt';
export type ComboTrigger = 'attack' | 'shield' | 'special';
export type StatType = 'attack' | 'defense' | 'speed' | 'evasion' | 'critChance' | 'critDamage';
export type ScalingFactor = 'enemiesHit' | 'drawnCardsCost' | 'turnNumber' | 'cardsPlayedThisTurn' | 'damageTakenThisTurn' | 'cardsDiscardedThisTurn' | 'cardsDiscardedThisBattle' | 'userShield' | 'corruptionStacks' | 'enemyCorruptionStacks' | 'discardedCardCount';
export type DamageFormulaKey = 'LIGHT' | 'LIGHT2' | 'WEAK' | 'WEAK2' | 'BASIC' | 'BASIC2' | 'STRONG' | 'STRONG2' | 'HEAVY' | 'HEAVY2' | 'MEGA' | 'MEGA2' | 'CRITICAL_ATTACK' | 'LIGHT_HEAL' | 'WEAK_HEAL' | 'BASIC_HEAL' | 'STRONG_HEAL' | 'HEAVY_HEAL' | 'MEGA_HEAL' | 'CUSTOM';
export type DigivolutionStage = 'In-Training' | 'Rookie' | 'Champion' | 'Ultimate' | 'Armor' | 'Mega' | 'Ultra';
export type EnemyAction = {
  type: 'ENEMY_ACTION';
  attackingEnemyIndex: number;
  targetPlayerIndex: number;
  damage: number;
};

// Card-related interfaces
export interface CardEffect {
  damage?: {
    formula: DamageFormulaKey;
    target: TargetType;
  };
  shield?: {
    formula: DamageFormulaKey;
    target: TargetType;
  };
  heal?: {
    formula: DamageFormulaKey;
    target: TargetType;
  };
  drawCards?: number;
  repeat?: number;
  discardCards?: number | 'all';
  gainRam?: number | 'discardedCardCost' | 'discardedCardCount';
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
    isResistable?: boolean;
    source?: number;
  };
  once?: boolean;
  duration?: number;
  description: string;
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
    stat: StatType;
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
    condition: (state: GameState, targetInfo: TargetInfo) => boolean;
    effect: CardEffect;
  };
  customEffect?: (state: GameState) => void;
}

export type BattleAction = 
  | { type: 'PLAY_CARD'; card: Card; targetInfo: TargetInfo }
  | { type: 'DRAW_CARD'; card: Card }
  | { type: 'BURN_CARD'; card: Card }
  | { type: 'DISCARD_CARD'; card: Card }
  | { type: 'SHUFFLE_DISCARD_TO_DECK' }
  | { type: 'END_PLAYER_TURN' }
  | { type: 'END_ENEMY_TURN' }
  | EnemyAction
  | { type: 'DIGIMON_DEATH'; digimonIndex: number }
  | { type: 'BURN_CARD'; card: Card }
  | { type: 'ANIMATE_ATTACK'; sourceIndex: number; targetIndex: number; isEnemy: boolean }
  | { type: 'APPLY_DAMAGE'; target: TargetInfo; damage: number; newHp: number; newShield: number };

export interface TargetInfo {
  targetType: TargetType;
  sourceDigimonIndex: number;
  targetDigimonIndex: number;
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
  ownerDigimonIndex: number;
}

// Game state interfaces
export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value: number;
  isResistable?: boolean;
  source?: number;
}

export interface GameState {
  player: {
    digimon: (Digimon | DigimonState)[];
    hand: Card[];
    deck: Card[];
    discardPile: Card[];
    ram: number;
  };
  enemy: {
    digimon: DigimonState[];
  };
  actionQueue: BattleAction[];
  turn: number;
  phase: 'player' | 'enemy' | 'initial';
  cardsPlayedThisTurn: number;
  damageTakenThisTurn: number;
  cardsDiscardedThisTurn: number;
  cardsDiscardedThisBattle: number;
  lastPlayedCardType?: CardEffectType;
  temporaryEffects: {
    costModifications: Array<{
      target: 'all' | 'specific';
      cardId?: string;
      amount: number;
      duration: number;
      turnsRemaining: number;
    }>;
    statMultipliers: Array<{
      stat: StatType;
      multiplier: number;
      duration: number;
      turnsRemaining: number;
    }>;
    burstCards: Card[];
    onceEffectsUsed: string[]; 
  };
  removedCards: { [digimonIndex: number]: Card[] };
}

// Digimon-related interfaces

export interface PassiveSkill {
  name: string;
  description: string;
  effect: (state: GameState, digimon: Digimon) => GameState;
  ramModifier?: (ram: number) => number;
}

export interface DigimonState {
  id: string;
  name: string;
  displayName: string;
  type: DigimonType;
  level: number;
  exp: number;
  digivolutionStage: DigivolutionStage;
  
  // Base stats
  hp: number;
  maxHp: number;
  attack: number;
  healing: number;
  
  // Percentage stats (represented as decimals, e.g., 0.15 for 15%)
  evasion: number;  
  critChance: number;
  accuracy: number;
  
  // Resistances (represented as decimals, e.g., 0.3 for 30% resistance)
  corruptionResistance: number;
  buggedResistance: number;
  
  shield: number;
  statusEffects: StatusEffect[];
  
  // Passive skill (can be null)
  passiveSkill: PassiveSkill | null;
  nickname?: string;
  dateObtained: Date;
}

export interface DigimonTemplate {
  name: string;
  displayName: string;
  type: DigimonType;
  digivolutionStage: DigivolutionStage;
  baseHp: number;
  baseAttack: number;
  baseHealing: number;
  baseEvadeChance: number;
  baseCritChance: number;
  baseAccuracy: number;
  baseCorruptionResistance: number;
  baseBuggedResistance: number;
  startingCard: Card;
  passiveSkill: PassiveSkill | null;
}

export interface Digimon extends DigimonState {
  deck: Card[];
  dateObtained: Date;
  nickname?: string;
  level: number;
  exp: number;
  expToNextLevel: number;
}

export interface DigimonEgg {
  id: number;
  typeId: number;
  hatchTime: number;
}

// Battle-related interfaces
export interface BattleActions {
  drawCard: (amount: number) => void;
  setPlayerRam: (amount: number) => void;
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
  gainRam: (amount: number) => void;
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
  FREE: 'white',
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};

export const CORRUPTION_DAMAGE_PER_STACK = 7;