import { Digimon, GameState, Card, TargetInfo, DigimonState } from '../shared/types';
import { calculateDamage } from '../shared/damageCalculations';
import { applyStatusEffects } from './statusEffects';
import { STARTING_ENERGY, CARDS_DRAWN_PER_TURN, MAX_ENERGY } from './gameConstants';
import { resolveCardEffects } from './cardEffects';

export const initializeBattle = (playerDigimon: Digimon, enemyDigimon: Digimon): GameState => {
  return {
    player: {
      digimon: [playerDigimon],
      hand: [],
      deck: [...playerDigimon.deck],
      discardPile: [],
      energy: STARTING_ENERGY,
    },
    enemy: {
      digimon: [enemyDigimon],
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
  };
};

export const startPlayerTurn = (gameState: GameState): GameState => {
    let updatedState = { ...gameState };
    updatedState.player.energy = Math.min(gameState.turn, MAX_ENERGY);
    updatedState = drawCards(updatedState, CARDS_DRAWN_PER_TURN);
    
    // Apply status effects to the player's Digimon
    const playerDigimon = updatedState.player.digimon[0] as Digimon;
    const updatedDigimonState = applyStatusEffects(playerDigimon);
    
    // Reconstruct the Digimon object with the updated state
    updatedState.player.digimon[0] = {
      ...playerDigimon,
      ...updatedDigimonState
    };
  
    updatedState.cardsPlayedThisTurn = 0;
    updatedState.damageTakenThisTurn = 0;
    updatedState.cardsDiscardedThisTurn = 0;
    return updatedState;
  };

  export const playCard = (gameState: GameState, cardIndex: number, targetInfo: TargetInfo): GameState => {
    const card = gameState.player.hand[cardIndex];
    if (!card) {
      throw new Error('Invalid card index');
    }
  
    const updatedHand = gameState.player.hand.filter((_, index) => index !== cardIndex);
  
    // Apply card effects
    let updatedState = resolveCardEffects(card, { ...gameState, player: { ...gameState.player, hand: updatedHand } }, targetInfo);
  
    updatedState = {
      ...updatedState,
      player: {
        ...updatedState.player,
        discardPile: [...updatedState.player.discardPile, card]
      },
      cardsPlayedThisTurn: updatedState.cardsPlayedThisTurn + 1
    };
  
    return updatedState;
  }

export const endPlayerTurn = (gameState: GameState): GameState => {
  // Implement end of turn logic
  return {
    ...gameState,
    phase: 'enemy',
  };
};

export const executeEnemyTurn = (gameState: GameState): GameState => {
  // Implement enemy AI and turn execution
  return gameState;
};

const drawCards = (gameState: GameState, amount: number): GameState => {
  const newHand = [...gameState.player.hand];
  const newDeck = [...gameState.player.deck];

  for (let i = 0; i < amount; i++) {
    if (newDeck.length > 0) {
      const drawnCard = newDeck.pop();
      if (drawnCard) {
        newHand.push(drawnCard);
      }
    }
  }

  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: newHand,
      deck: newDeck,
    },
  };
};

export function applyDamage(damage: number, target: DigimonState, gameState: GameState, targetInfo: TargetInfo): GameState {
  const updatedState = { ...gameState };
  const isPlayerDigimon = updatedState.player.digimon.includes(target);
  const digimonList = isPlayerDigimon ? updatedState.player.digimon : updatedState.enemy.digimon;
  const targetIndex = digimonList.findIndex(d => d.id === target.id);

  if (targetIndex === -1) {
    throw new Error('Target Digimon not found');
  }

  digimonList[targetIndex] = {
    ...digimonList[targetIndex],
    hp: Math.max(0, digimonList[targetIndex].hp - damage)
  };

  if (isPlayerDigimon) {
    updatedState.player.digimon = digimonList;
  } else {
    updatedState.enemy.digimon = digimonList;
  }

  return updatedState;
}

export const checkBattleEnd = (gameState: GameState): 'ongoing' | 'player_win' | 'enemy_win' => {
  if (gameState.player.digimon[0].hp <= 0) {
    return 'enemy_win';
  } else if (gameState.enemy.digimon[0].hp <= 0) {
    return 'player_win';
  }
  return 'ongoing';
};

export const calculateDamageWithCrit = (attacker: DigimonState, baseDamage: number): number => {
  const isCritical = Math.random() < attacker.critChance;
  const critMultiplier = isCritical ? 1.5 : 1; 
  
  return Math.round(baseDamage * critMultiplier);
};

// more battle-related functions as needed