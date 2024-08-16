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
  playerHand: Card[];
  playerDeck: Card[];
  playerDiscardPile: Card[];
  enemyBlock: number;
}

export interface Card {
  id: number;
  name: string;
  type: 'attack' | 'block' | 'special';
  cost: number;
  damage?: number;
  block?: number;
  effect?: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void;
}

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