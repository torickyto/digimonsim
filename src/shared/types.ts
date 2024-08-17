
export type DigimonType = 'NULL' | 'DATA' | 'VACCINE' | 'VIRUS';

export interface CardType {
  id: string;
  name: string;
  type: 'attack' | 'block' | 'special';
  cost: number;
  description: string;
  effect?: (attacker: Digimon, defender: Digimon, battleState: BattleState, selectedCard?: CardInstance) => void;
  digimonType: DigimonType;
  damage?: number;
  block?: number;
  requiresCardSelection?: boolean;
  requiresTarget?: boolean;
}

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
  discardCard: (amount: number) => CardType[];
  discardHand: () => void;
  drawCard: (amount: number) => CardType[];
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


export interface CardInstance extends CardType {
  instanceId: string;
}

export interface BaseCard {
  id: number;
  name: string;
  cost: number;
  description: string;
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
  NULL: 'white',
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};