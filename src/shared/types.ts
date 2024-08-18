// types.ts

// Enums and basic types
export type DigimonType = 'NULL' | 'DATA' | 'VACCINE' | 'VIRUS';
export type CardEffectType = 'attack' | 'block' | 'special';
export type TargetType = 'self' | 'enemy' | 'all_enemies' | 'random_enemy' | 'all_allies' | 'random_ally';
export type Card = CardType | CardInstance | AttackCard | BlockCard | SpecialCard;

// Card-related interfaces
export interface BaseCard {
  id: string;
  name: string;
  cost: number;
  description: string;
}

export interface CardEffect {
  damage?: number;
  block?: number;
  heal?: number;
  drawCards?: number;
  discardCards?: number;
  gainEnergy?: number;
  removeEnemyBlock?: boolean;
  customEffect?: (state: GameState) => void;
}

export interface GameState {
  player: {
    energy: number;
    hand: Card[];
    deck: Card[];
    discardPile: Card[];
    digimon: Digimon[];
  };
  enemy: {
    digimon: Digimon[];
  };
}

export interface CardTemplate {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  digimonType: DigimonType;
  description: string;
  target: TargetType;
  effects: CardEffect[];
  requiresCardSelection?: boolean;
}

export interface CardType extends BaseCard {
  type: CardEffectType;
  digimonType: DigimonType;
  effect?: (attacker: Digimon, defender: Digimon, battleState: BattleState, selectedCard?: CardInstance) => void;
  damage?: number;
  block?: number;
  requiresCardSelection?: boolean;
  requiresTarget?: boolean;
}

export interface CardInstance extends CardType {
  instanceId: string;
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

// Digimon-related interfaces
export interface DigimonTemplate {
  name: string;
  displayName: string;
  type: DigimonType;
  baseHp: number;
  startingCard: CardType;
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
  startingCard: CardType;
  deck: CardType[];
}

export interface DigimonEgg {
  id: number;
  hatchTime: number;
  possibleDigimon: string[];
}

// Battle-related interfaces
export interface BattleState {
  playerEnergy: number;
  playerHand: CardType[];
  playerDeck: CardType[];
  playerDiscardPile: CardType[];
  enemyHp: number;
  enemyBlock: number;
  discardCard: (amount: number) => CardType[];
  discardHand: () => void;
  drawCard: (amount: number, callback?: () => void) => CardType[];
  discardRandomCards: (amount: number) => CardType[];
  discardSpecificCard: (cardToDiscard: CardInstance) => void;
  getDiscardedCardCount: () => number;
  healRandomAlly: (amount: number) => void;
  addRandomAllyBlock: (amount: number) => void;
  damageRandomEnemy: (amount: number) => void;
  setPlayerEnergy: (amount: number) => void;
  damageEnemy: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addPlayerBlock: (amount: number) => void;
  addEnemyBlock: (amount: number) => void;
  setEnemyBlock: (amount: number) => void;
}

export interface BattleActions {
  drawCard: (amount: number) => void;
  setPlayerEnergy: (amount: number) => void;
  damageEnemy: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  addPlayerBlock: (amount: number) => void;
  addEnemyBlock: (amount: number) => void;
}

// Player-related interfaces
export interface Player {
  party: Digimon[];
  eggs: DigimonEgg[];
  currentDigimon: Digimon;
}

// Utility constants
export const TYPE_COLORS: Record<DigimonType, string> = {
  NULL: 'white',
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};