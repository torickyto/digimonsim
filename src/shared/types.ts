
export type DigimonType = 'DATA' | 'VACCINE' | 'VIRUS';

export interface SpecialAbility {
  name: string;
  cost: number;
  effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void;
  description: string;
}

export interface DigimonTemplate {
  name: string;
  displayName: string;
  type: DigimonType;
  baseHp: number;
  specialAbility: SpecialAbility;
}

export interface Digimon extends DigimonTemplate {
  id: number;
  hp: number;
  maxHp: number;
  block: number;
  level: number;
  exp: number;
  deck: CardType[];
}

export interface CardType {
  id: string;
  name: string;
  type: 'attack' | 'block' | 'special';
  cost: number;
  description: string;
  damage?: number;
  block?: number;
  effect?: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void;
}

export interface AttackCard extends CardType {
  type: 'attack';
  damage: number;
}

export interface BlockCard extends CardType {
  type: 'block';
  block: number;
}

export interface SpecialCard extends CardType {
  type: 'special';
  effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void;
}

export interface BattleState {
  playerEnergy: number;
  playerHand: CardType[];
  playerDeck: CardType[];
  playerDiscardPile: CardType[];
  enemyHp: number;
  enemyBlock: number;
  drawCard: (amount: number) => void;
  discardCard: (amount: number) => void;
  setPlayerEnergy: (amount: number) => void;
  damageEnemy: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addPlayerBlock: (amount: number) => void;
  addEnemyBlock: (amount: number) => void;
  setEnemyBlock: (amount: number) => void;
}

export interface BaseCard {
  id: number;
  name: string;
  cost: number;
  description: string;
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