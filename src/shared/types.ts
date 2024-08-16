// File: src/shared/types.ts

export type DigimonType = 'DATA' | 'VACCINE' | 'VIRUS';

export interface SpecialAbility {
  name: string;
  cost: number;
  effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void;
  description: string;
}

export interface Digimon {
  id: number;
  name: string;
  displayName: string;
  type: DigimonType;
  hp: number;
  maxHp: number;
  block: number;
  level: number;
  exp: number;
  baseHp: number;
  specialAbility: SpecialAbility;
}

export interface BattleState {
  playerEnergy: number;
  playerHand: CardType[];
  playerDeck: CardType[];
  playerDiscardPile: CardType[];
  enemyBlock: number;
}

// New Card Type Definitions
export interface BaseCard {
  id: number;
  name: string;
  cost: number;
}

export interface AttackCard extends BaseCard {
  type: 'attack';
  damage: number;
}

export interface BlockCard extends BaseCard {
  type: 'block';
  block: number;
}

export interface SpecialCard extends BaseCard {
  type: 'special';
  effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void;
}

export type CardType = AttackCard | BlockCard | SpecialCard;

export interface DigimonTemplate {
  name: string;
  displayName: string;
  type: DigimonType;
  baseHp: number;
  specialAbility: SpecialAbility;
}

export interface DigimonEgg {
  id: number;
  hatchTime: number;
  possibleDigimon: string[];
}

export interface Player {
  party: Digimon[];
  eggs: DigimonEgg[];
  currentDigimon: Digimon;
}

export interface BattleActions {
  drawCard: (amount: number) => void;
  setPlayerEnergy: (amount: number) => void;
  damageEnemy: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addPlayerBlock: (amount: number) => void;
  addEnemyBlock: (amount: number) => void;
}

export const TYPE_COLORS: Record<DigimonType, string> = {
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};