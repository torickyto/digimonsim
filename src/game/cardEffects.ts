// src/game/cardEffects.ts

import { Card, GameState, CardEffect, ComboTrigger, ScalingFactor, StatusEffectType } from '../shared/types';

// Basic Effects
export function applyConsumable(card: Card, gameState: GameState): GameState {
  const updatedDeck = gameState.player.deck.filter(c => c.id !== card.id);
  const updatedDiscardPile = gameState.player.discardPile.filter(c => c.id !== card.id);
  
  return {
    ...gameState,
    player: {
      ...gameState.player,
      deck: updatedDeck,
      discardPile: updatedDiscardPile,
    },
  };
}

export function applyBurst(card: Card, gameState: GameState): GameState {
  const updatedHand = gameState.player.hand.filter(c => c.id !== card.id);
  
  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: updatedHand,
    },
  };
}

export function applyRecompile(card: Card, gameState: GameState): GameState {
  const cardCopy = { ...card, instanceId: `${card.id}_${Date.now()}` };
  
  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: [...gameState.player.hand, cardCopy],
    },
  };
}

// Combo Effects
export function checkCombo(card: Card, gameState: GameState): CardEffect | null {
  const comboEffect = card.effects.find(effect => effect.combo);
  if (!comboEffect || !comboEffect.combo) return null;

  const { trigger, effect } = comboEffect.combo;
  
  if (gameState.lastPlayedCardType === trigger) {
    return effect;
  }

  return null;
}

// Scaling Effects
export function getScalingValue(factor: ScalingFactor, gameState: GameState): number {
  switch (factor) {
    case 'turnNumber':
      return gameState.turn;
    case 'cardsPlayedThisTurn':
      return gameState.cardsPlayedThisTurn;
    case 'damageTakenThisTurn':
      return gameState.damageTakenThisTurn;
    case 'cardsDiscardedThisTurn':
      return gameState.cardsDiscardedThisTurn;
    case 'corruptionStacks':
      return gameState.player.digimon[0].statusEffects.filter(effect => effect.type === 'corruption' as StatusEffectType).length;
    case 'enemyCorruptionStacks':
      return gameState.enemy.digimon[0].statusEffects.filter(effect => effect.type === 'corruption' as StatusEffectType).length;
    default:
      return 0;
  }
}

export function applyScaling(card: Card, gameState: GameState): CardEffect {
  const scalingEffect = card.effects.find(effect => effect.scaling);
  if (!scalingEffect || !scalingEffect.scaling) return {};

  const { factor, effect } = scalingEffect.scaling;
  const value = getScalingValue(factor, gameState);
  
  return effect(value);
}

// Conditional Effects
export function checkConditional(card: Card, gameState: GameState): CardEffect | null {
  const conditionalEffect = card.effects.find(effect => effect.conditional);
  if (!conditionalEffect || !conditionalEffect.conditional) return null;

  const { condition, effect } = conditionalEffect.conditional;
  
  if (condition(gameState)) {
    return effect;
  }

  return null;
}

// Card Effect Resolver
export function resolveCardEffects(card: Card, gameState: GameState): GameState {
  let updatedState = { ...gameState };

  // Apply basic effects
  card.effects.forEach(effect => {
    if (effect.damage) updatedState = applyDamage(effect.damage, updatedState);
    if (effect.shield) updatedState = applyShield(effect.shield, updatedState);
    if (effect.heal) updatedState = applyHeal(effect.heal, updatedState);
    if (effect.drawCards) updatedState = drawCards(effect.drawCards, updatedState);
    if (effect.discardCards) updatedState = discardCards(effect.discardCards, updatedState);
    if (effect.gainEnergy) updatedState = gainEnergy(effect.gainEnergy, updatedState);
    if (effect.removeEnemyShield) updatedState = removeEnemyShield(updatedState);
    if (effect.removeAllShield) updatedState = removeAllShield(updatedState);
    if (effect.removeAilments) updatedState = removeAilments(updatedState);
  });

  // Check and apply combo effect
  const comboEffect = checkCombo(card, updatedState);
  if (comboEffect) {
    updatedState = resolveCardEffects({ ...card, effects: [comboEffect] }, updatedState);
  }

  // Apply scaling
  const scaledEffect = applyScaling(card, updatedState);
  updatedState = resolveCardEffects({ ...card, effects: [scaledEffect] }, updatedState);

  // Check and apply conditional effect
  const conditionalEffect = checkConditional(card, updatedState);
  if (conditionalEffect) {
    updatedState = resolveCardEffects({ ...card, effects: [conditionalEffect] }, updatedState);
  }

  // Apply consumable, burst, and recompile effects
  if (card.effects.some(effect => effect.consumable)) {
    updatedState = applyConsumable(card, updatedState);
  }
  if (card.effects.some(effect => effect.burst)) {
    updatedState = applyBurst(card, updatedState);
  }
  if (card.effects.some(effect => effect.recompile)) {
    updatedState = applyRecompile(card, updatedState);
  }

  return updatedState;
}

// Helper functions for basic effects (to be implemented)
function applyDamage(amount: number, gameState: GameState): GameState {
  // Implement damage logic
  return gameState;
}

function applyHeal(amount: number, gameState: GameState): GameState {
  // Implement heal logic
  return gameState;
}

function applyShield(amount: number, gameState: GameState): GameState {
  // Implement shield logic
  return gameState;
}

function drawCards(amount: number, gameState: GameState): GameState {
  // Implement draw cards logic
  return gameState;
}

function discardCards(amount: number, gameState: GameState): GameState {
  // Implement discard cards logic
  return gameState;
}

function gainEnergy(amount: number, gameState: GameState): GameState {
  // Implement gain energy logic
  return gameState;
}

function removeEnemyShield(gameState: GameState): GameState {
  // Implement remove enemy shield logic
  return gameState;
}

function removeAllShield(gameState: GameState): GameState {
  // Implement remove all shield logic
  return gameState;
}

function removeAilments(gameState: GameState): GameState {
  // Implement remove ailments logic
  return gameState;
}