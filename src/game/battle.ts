// battle.ts

import { Digimon, StatusEffect, DigimonState, GameState, Card, BattleAction, TargetInfo } from '../shared/types';
import { STARTING_RAM, BASE_RAM, MAX_HAND_SIZE, CARDS_DRAWN_PER_TURN, MAX_RAM } from './gameConstants';
import { calculateDamage } from '../shared/damageCalculations';
import { applyStatusEffects } from './statusEffects';
import { resolveCardEffects } from './cardEffects';

export const initializeBattle = (playerTeam: Digimon[], enemyTeam: Digimon[]): GameState => {
  const initialState: GameState = {
    player: {
      digimon: playerTeam,
      hand: [],
      deck: playerTeam.flatMap(digimon => digimon.deck),
      discardPile: [],
      ram: calculateStartingRam(playerTeam),
    },
    enemy: {
      digimon: enemyTeam,
    },
    turn: 1,
    phase: 'player',
    cardsPlayedThisTurn: 0,
    damageTakenThisTurn: 0,
    cardsDiscardedThisTurn: 0,
    cardsDiscardedThisBattle: 0,
    temporaryEffects: {
      costModifications: [],
      statMultipliers: [],
      burstCards: [],
    },
    actionQueue: [],
  };

  initialState.player.deck = shuffleDeck(initialState.player.deck);

  return drawInitialHand(initialState);
};

const calculateStartingRam = (playerTeam: Digimon[]): number => {
  let ram = STARTING_RAM;
  playerTeam.forEach(digimon => {
    if (digimon.passiveSkill && typeof digimon.passiveSkill.ramModifier === 'function') {
      ram = digimon.passiveSkill.ramModifier(ram);
    }
  });
  return Math.min(ram, MAX_RAM);
};

const shuffleDeck = (deck: Card[]): Card[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const drawInitialHand = (gameState: GameState): GameState => {
  const cardsToDraw = Math.min(gameState.player.digimon.length + 2, 5);
  let updatedState = { ...gameState };

  for (let i = 0; i < cardsToDraw; i++) {
    updatedState = drawSingleCard(updatedState);
  }

  return updatedState;
};

const drawSingleCard = (gameState: GameState): GameState => {
  if (gameState.player.deck.length === 0) {
    gameState.player.deck = shuffleDeck([...gameState.player.discardPile]);
    gameState.player.discardPile = [];
    gameState.actionQueue.push({ type: 'SHUFFLE_DISCARD_TO_DECK' });
  }

  if (gameState.player.deck.length > 0) {
    const drawnCard = gameState.player.deck.pop()!;

    if (gameState.player.hand.length < MAX_HAND_SIZE) {
      gameState.player.hand.push(drawnCard);
      gameState.actionQueue.push({ type: 'DRAW_CARD', card: drawnCard });
    } else {
      gameState.player.discardPile.push(drawnCard);
      gameState.cardsDiscardedThisBattle++;
      gameState.actionQueue.push({ type: 'BURN_CARD', card: drawnCard });
    }
  }

  return { ...gameState };
};

export const startPlayerTurn = (state: GameState): GameState => {
  let updatedState = { ...state };

  updatedState.player.digimon.forEach(digimon => {
    if (digimon.passiveSkill && typeof digimon.passiveSkill.ramModifier === 'function') {
      updatedState.player.ram = digimon.passiveSkill.ramModifier(updatedState.player.ram);
    }
  });
  updatedState.player.ram = Math.min(updatedState.player.ram, MAX_RAM);

  // Apply RAM modifiers from Digimon abilities or items
  updatedState.player.digimon.forEach(digimon => {
    if (digimon.passiveSkill && typeof digimon.passiveSkill.ramModifier === 'function') {
      updatedState.player.ram = digimon.passiveSkill.ramModifier(updatedState.player.ram);
    }
  });

  updatedState.player.ram = Math.min(updatedState.player.ram, MAX_RAM);

  // Draw one card if there's room in the hand and cards in the deck
  if (updatedState.player.hand.length < MAX_HAND_SIZE && updatedState.player.deck.length > 0) {
    const drawnCard = updatedState.player.deck.pop()!;
    updatedState.player.hand.push(drawnCard);


    // add the card draw to the action queue for animation
    updatedState.actionQueue.push({ type: 'DRAW_CARD', card: drawnCard });
  }

  // Apply any start-of-turn effects
  updatedState = applyStartOfTurnEffects(updatedState);

  // Set the phase to player's turn
  updatedState.phase = 'player';

  return updatedState;
};

const applyStartOfTurnEffects = (state: GameState): GameState => {
  let updatedState: GameState = { ...state };

  updatedState.player.digimon = updatedState.player.digimon.map(digimon => ({
    ...digimon,
    statusEffects: digimon.statusEffects
      .map((effect: StatusEffect) => ({
        ...effect,
        duration: effect.duration > 0 ? effect.duration - 1 : effect.duration
      }))
      .filter((effect: StatusEffect) => effect.duration !== 0)
  })) as Digimon[];

  return updatedState;
};

export const playCard = (gameState: GameState, cardIndex: number, targetInfo: TargetInfo): GameState => {
  const card = gameState.player.hand[cardIndex];
  if (!card) {
    throw new Error('Invalid card index');
  }

  const updatedHand = gameState.player.hand.filter((_, index) => index !== cardIndex);

  let updatedState = resolveCardEffects(card, { ...gameState, player: { ...gameState.player, hand: updatedHand } }, targetInfo);

  updatedState = {
    ...updatedState,
    player: {
      ...updatedState.player,
      discardPile: [...updatedState.player.discardPile, card]
    },
    cardsPlayedThisTurn: updatedState.cardsPlayedThisTurn + 1
  };

  updatedState.actionQueue.push({ type: 'PLAY_CARD', card, targetInfo });

  return updatedState;
};

export const endPlayerTurn = (gameState: GameState): GameState => {
  let updatedState: GameState = {
    ...gameState,
    phase: 'enemy',
    turn: gameState.turn + 1,
    cardsPlayedThisTurn: 0,
    cardsDiscardedThisTurn: 0,
  };

  updatedState.actionQueue.push({ type: 'END_PLAYER_TURN' });

  return updatedState;
};

export const executeEnemyTurn = (gameState: GameState): GameState => {
  let updatedState: GameState = { ...gameState };

  // Placeholder for enemy actions
  updatedState.actionQueue.push({ type: 'ENEMY_ACTION' });

  // After enemy turn, prepare for the next player turn
  updatedState = prepareNextPlayerTurn(updatedState);

  return updatedState;
};

const prepareNextPlayerTurn = (gameState: GameState): GameState => {
  let updatedState: GameState = { ...gameState };

  // Reset RAM to the calculated value based on the team's current state
  updatedState.player.ram = calculateStartingRam(updatedState.player.digimon as Digimon[]);

  // Draw cards if there's room in the hand
  const cardsToDraw = Math.min(CARDS_DRAWN_PER_TURN, MAX_HAND_SIZE - updatedState.player.hand.length);
  for (let i = 0; i < cardsToDraw; i++) {
    updatedState = drawSingleCard(updatedState);
  }

  // Apply any start-of-turn effects
  updatedState = applyStartOfTurnEffects(updatedState);

  // Set the phase to player's turn
  updatedState.phase = 'player';

  return updatedState;
};

const drawCards = (gameState: GameState, amount: number): GameState => {
  let updatedState = { ...gameState };

  for (let i = 0; i < amount; i++) {
    updatedState = drawSingleCard(updatedState);
  }

  return updatedState;
};

export const applyDamage = (damage: number, target: DigimonState, gameState: GameState, targetInfo: TargetInfo): GameState => {
  const updatedState = { ...gameState };
  const isPlayerDigimon = updatedState.player.digimon.some(d => d.id === target.id);
  const digimonList = isPlayerDigimon ? updatedState.player.digimon : updatedState.enemy.digimon;
  const targetIndex = digimonList.findIndex(d => d.id === target.id);

  if (targetIndex === -1) {
    throw new Error('Target Digimon not found');
  }

  const updatedHp = Math.max(0, digimonList[targetIndex].hp - damage);
  const updatedDigimon = {
    ...digimonList[targetIndex],
    hp: updatedHp
  };

  if (isPlayerDigimon) {
    updatedState.player.digimon = updatedState.player.digimon.map((d, index) => 
      index === targetIndex ? { ...d, ...updatedDigimon } as Digimon : d
    );
  } else {
    updatedState.enemy.digimon = updatedState.enemy.digimon.map((d, index) => 
      index === targetIndex ? updatedDigimon : d
    );
  }

  updatedState.actionQueue.push({ 
    type: 'APPLY_DAMAGE', 
    target: targetInfo, 
    damage, 
    newHp: updatedHp 
  });

  return updatedState;
};

export const checkBattleEnd = (gameState: GameState): 'ongoing' | 'player_win' | 'enemy_win' => {
  if (gameState.player.digimon.every(d => d.hp <= 0)) {
    return 'enemy_win';
  } else if (gameState.enemy.digimon.every(d => d.hp <= 0)) {
    return 'player_win';
  }
  return 'ongoing';
};

export const calculateDamageWithCrit = (attacker: Digimon, baseDamage: number): number => {
  const isCritical = Math.random() < attacker.critChance;
  const critMultiplier = isCritical ? 1.5 : 1; 
  
  return Math.round(baseDamage * critMultiplier);
};

export const discardCard = (gameState: GameState, cardIndex: number): GameState => {
  const updatedState = { ...gameState };
  if (cardIndex >= 0 && cardIndex < updatedState.player.hand.length) {
    const discardedCard = updatedState.player.hand.splice(cardIndex, 1)[0];
    updatedState.player.discardPile.push(discardedCard);
    updatedState.cardsDiscardedThisTurn++;
    updatedState.cardsDiscardedThisBattle++;
    updatedState.actionQueue.push({ type: 'DISCARD_CARD', card: discardedCard });
  }
  return updatedState;
};

// Add more battle-related functions as needed