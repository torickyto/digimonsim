import { Digimon, StatusEffect, DigimonState, GameState, Card, BattleAction, TargetInfo, DamageFormulaKey } from '../shared/types';
import { STARTING_RAM, BASE_RAM, MAX_HAND_SIZE, CARDS_DRAWN_PER_TURN, MAX_RAM } from './gameConstants';
import { DigimonTemplates } from '../data/DigimonTemplate';
import { createDigimon } from '../shared/digimonManager';
import { calculateDamage, DamageCalculations } from '../shared/damageCalculations';
import { applyStatusEffects } from './statusEffects';
import { resolveCardEffects } from './cardEffects';


export const initializeBattle = (playerTeam: Digimon[], enemyTeam: Digimon[]): GameState => {
  const initialState: GameState = {
    player: {
      digimon: playerTeam.map(digimon => ({ ...digimon })), // Create a new object for each Digimon
      hand: [],
      deck: playerTeam.flatMap((digimon, index) => 
        digimon.deck.map(card => ({ ...card, ownerDigimonIndex: index }))
      ),
      discardPile: [],
      ram: calculateStartingRam(playerTeam),
    },
    enemy: {
      digimon: enemyTeam.map(digimon => ({ ...digimon })),
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
      onceEffectsUsed: []
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

  // Apply RAM modifiers from Digimon abilities or items
  updatedState.player.digimon.forEach(digimon => {
    if (digimon.passiveSkill && typeof digimon.passiveSkill.ramModifier === 'function') {
      updatedState.player.ram = digimon.passiveSkill.ramModifier(updatedState.player.ram);
    }
  });
  updatedState.player.ram = Math.min(updatedState.player.ram, MAX_RAM);

  // Draw one card if it's not the first turn and there's room in the hand
  if (updatedState.turn > 1 && updatedState.player.hand.length < MAX_HAND_SIZE) {
    const { newState, drawnCard } = drawCard(updatedState);
    updatedState = newState;
  }

  // Apply any start-of-turn effects
  updatedState = applyStartOfTurnEffects(updatedState);
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

  let updatedState = resolveCardEffects(card, { 
    ...gameState, 
    player: { 
      ...gameState.player, 
      hand: updatedHand 
    } 
  }, targetInfo);

  let damage = 0;
  if (card.type === 'attack') {
    const damageEffect = card.effects.find(effect => effect.damage);
    if (damageEffect && damageEffect.damage && damageEffect.damage.formula) {
      const sourceDigimon = gameState.player.digimon[targetInfo.sourceDigimonIndex];
      damage = DamageCalculations[damageEffect.damage.formula](sourceDigimon);
    }
  }

  updatedState = {
    ...updatedState,
    player: {
      ...updatedState.player,
      digimon: [...gameState.player.digimon], // Preserve the player's Digimon
      ram: updatedState.player.ram - card.cost,
      discardPile: [...updatedState.player.discardPile, card]
    },
    enemy: {
      ...updatedState.enemy,
      digimon: updatedState.enemy.digimon.map((digimon, index) => 
        index === targetInfo.targetDigimonIndex && targetInfo.targetType === 'enemy'
          ? { ...digimon, hp: Math.max(0, digimon.hp - damage) }
          : digimon
      )
    },
    cardsPlayedThisTurn: updatedState.cardsPlayedThisTurn + 1
  };

  // Add animation-related actions to the queue
  updatedState.actionQueue.push({ 
    type: 'PLAY_CARD', 
    card, 
    targetInfo: { ...targetInfo, sourceDigimonIndex: card.ownerDigimonIndex }
  });
  // Add attack animation if it's an attack card
  if (card.type === 'attack' && targetInfo.targetDigimonIndex !== undefined) {
    updatedState.actionQueue.push({
      type: 'ANIMATE_ATTACK',
      sourceIndex: card.ownerDigimonIndex,
      targetIndex: targetInfo.targetDigimonIndex,
      isEnemy: targetInfo.targetType === 'enemy'
    });
  }

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

  updatedState.enemy.digimon.forEach((enemyDigimon, enemyIndex) => {
    if (enemyDigimon.hp <= 0) return; // Skip defeated enemies

    const targetPlayerIndex = Math.floor(Math.random() * updatedState.player.digimon.length);
    const targetPlayerDigimon = updatedState.player.digimon[targetPlayerIndex];

    updatedState.actionQueue.push({ 
      type: 'ENEMY_ACTION',
      attackingEnemyIndex: enemyIndex,
      targetPlayerIndex
    });

    updatedState.actionQueue.push({
      type: 'ANIMATE_ATTACK',
      sourceIndex: enemyIndex,
      targetIndex: targetPlayerIndex,
      isEnemy: true
    });

    const damage = calculateDamage('BASIC' as DamageFormulaKey, enemyDigimon, targetPlayerDigimon);
    updatedState = applyDamage(damage, targetPlayerDigimon, updatedState, {
      targetType: 'single_ally',
      sourceDigimonIndex: enemyIndex,
      targetDigimonIndex: targetPlayerIndex
    });
  });

  return prepareNextPlayerTurn(updatedState);
};


const prepareNextPlayerTurn = (gameState: GameState): GameState => {
  let updatedState: GameState = { ...gameState };

  // Reset RAM to the calculated value based on the team's current state
  updatedState.player.ram = calculateStartingRam(updatedState.player.digimon as Digimon[]);

  // Apply any start-of-turn effects
  updatedState = applyStartOfTurnEffects(updatedState);

  // Set the phase to player's turn
  updatedState.phase = 'player';

  return updatedState;
};

export const drawCard = (state: GameState): { newState: GameState; drawnCard: Card | null } => {
  let newState = { ...state };
  let drawnCard: Card | null = null;

  if (newState.player.deck.length === 0 && newState.player.discardPile.length > 0) {
    // Shuffle discard pile into deck
    newState.player.deck = [...newState.player.discardPile].sort(() => Math.random() - 0.5);
    newState.player.discardPile = [];
    newState.actionQueue.push({ type: 'SHUFFLE_DISCARD_TO_DECK' });
  }

  if (newState.player.deck.length > 0) {
    drawnCard = newState.player.deck.pop()!;
    if (newState.player.hand.length < MAX_HAND_SIZE) {
      newState.player.hand.push(drawnCard);
      newState.actionQueue.push({ type: 'DRAW_CARD', card: drawnCard });
    } else {
      newState.player.discardPile.push(drawnCard);
      newState.cardsDiscardedThisBattle++;
      newState.actionQueue.push({ type: 'BURN_CARD', card: drawnCard });
    }
  }

  return { newState, drawnCard };
};




export const applyDamage = (damage: number, target: Digimon | DigimonState, gameState: GameState, targetInfo: TargetInfo): GameState => {
  const updatedHp = Math.max(0, target.hp - damage);
  const updatedTarget = { ...target, hp: updatedHp };

  let updatedState = { ...gameState };

  if (targetInfo.targetType === 'enemy') {
    updatedState.enemy.digimon = updatedState.enemy.digimon.map((d, index) => 
      index === targetInfo.targetDigimonIndex ? updatedTarget : d
    );
  } else {
    updatedState.player.digimon = updatedState.player.digimon.map((d, index) => 
      index === targetInfo.targetDigimonIndex ? { ...d, ...updatedTarget } as Digimon : d
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