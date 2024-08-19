import { 
  GameState, 
  Card, 
  CardEffect, 
  TargetInfo, 
  DigimonState,
  StatusEffect,
  StatusEffectType,
  ScalingFactor,
  StatType
} from '../shared/types';
import { CORRUPTION_DAMAGE_PER_STACK } from '../game/gameConstants';
import { DamageCalculations } from '../shared/damageCalculations';

function getTargets(gameState: GameState, targetInfo: TargetInfo): DigimonState[] {
  const { targetType, sourceDigimonIndex, targetDigimonIndex } = targetInfo;
  switch (targetType) {
    case 'self':
      return [gameState.player.digimon[sourceDigimonIndex]];
    case 'single_ally':
      if (targetDigimonIndex === undefined) throw new Error('Target Digimon index is required for single_ally target type');
      return [gameState.player.digimon[targetDigimonIndex]];
    case 'enemy':
      if (targetDigimonIndex === undefined) throw new Error('Target Digimon index is required for enemy target type');
      return [gameState.enemy.digimon[targetDigimonIndex]];
    case 'all_enemies':
      return gameState.enemy.digimon;
    case 'random_enemy':
      return [gameState.enemy.digimon[Math.floor(Math.random() * gameState.enemy.digimon.length)]];
    case 'all_allies':
      return gameState.player.digimon;
    case 'random_ally':
      return [gameState.player.digimon[Math.floor(Math.random() * gameState.player.digimon.length)]];
    case 'none':
      return [];
    default:
      throw new Error(`Unknown target type: ${targetType}`);
  }
}

function resolveCardEffects(card: Card, gameState: GameState, targetInfo: TargetInfo): GameState {
  let updatedState = { ...gameState };
  const targets = getTargets(updatedState, targetInfo);

   card.effects.forEach(effect => {
    if (effect.damage && effect.damage.formula) {
      const damage = DamageCalculations[effect.damage.formula](updatedState.player.digimon[targetInfo.sourceDigimonIndex]);
      targets.forEach(target => {
        updatedState = applyDamage(damage, target, updatedState, targetInfo);
      });
    }

    if (effect.shield && effect.shield.formula) {
      const shieldAmount = DamageCalculations[effect.shield.formula](updatedState.player.digimon[targetInfo.sourceDigimonIndex]);
      targets.forEach(target => {
        updatedState = applyShield(shieldAmount, target, updatedState);
      });
    }

    if (effect.repeat) {
      for (let i = 0; i < effect.repeat; i++) {
        updatedState = resolveCardEffects({ ...card, effects: [{ ...effect, repeat: undefined }] }, updatedState, targetInfo);
      }
    }

    if (effect.heal && effect.heal.formula) {
      const healAmount = DamageCalculations[effect.heal.formula](updatedState.player.digimon[targetInfo.sourceDigimonIndex]);
      targets.forEach(target => {
        updatedState = applyHeal(healAmount, target, updatedState);
      });
    }

    if (effect.scaling) {
      updatedState = handleScaling(effect, updatedState, targetInfo);
    }

    if (effect.applyStatus) {
      targets.forEach(target => {
        updatedState = applyStatusEffect(effect.applyStatus, target, updatedState);
      });
    }

    if (effect.drawCards) updatedState = drawCards(effect.drawCards, updatedState);

    if (effect.discardCards) {
      updatedState = discardCards(effect.discardCards, updatedState);
      if (effect.gainEnergy === 'discardedCardCost') {
        const discardedCard = updatedState.player.discardPile[updatedState.player.discardPile.length - 1];
        if (discardedCard) {
          updatedState = gainEnergy(discardedCard.cost, updatedState);
        }
      }
    }

    if (typeof effect.gainEnergy === 'number') {
      updatedState = gainEnergy(effect.gainEnergy, updatedState);
    }

    if (effect.gainEnergy !== undefined) {
      updatedState = gainEnergyFromDiscardedCards(effect.gainEnergy, updatedState);
    }

    if (effect.removeEnemyShield) updatedState = removeEnemyShield(updatedState);
    if (effect.removeAllShield) updatedState = removeAllShield(updatedState);
    if (effect.removeAilments) updatedState = removeAilments(updatedState);
    if (effect.modifyCost) updatedState = modifyCost(effect.modifyCost, updatedState);
    if (effect.modifyStatMultiplier) updatedState = modifyStatMultiplier(effect.modifyStatMultiplier, updatedState);
    if (effect.scaling) updatedState = applyScalingEffect(effect.scaling, updatedState, targetInfo);
  });

  // Apply conditional effects
  card.effects.forEach(effect => {
    if (effect.conditional) {
      const condition = effect.conditional.condition(updatedState, targetInfo);
      if (condition) {
        updatedState = resolveCardEffects({ ...card, effects: [effect.conditional.effect] }, updatedState, targetInfo);
      }
    }
  });

  // Apply burst effect
  if (card.effects.some(effect => effect.burst)) {
    updatedState = applyBurst(card, updatedState);
  }

  // Apply recompile effect
  if (card.effects.some(effect => effect.recompile)) {
    updatedState = applyRecompile(card, updatedState);
  }

  return updatedState;
}

function applyDamage(damage: number, target: DigimonState, gameState: GameState, targetInfo: TargetInfo): GameState {
  const updatedTarget = { ...target, hp: Math.max(0, target.hp - damage) };
  return updateDigimonInState(gameState, updatedTarget);
}

function applyShield(amount: number, target: DigimonState, gameState: GameState): GameState {
  const updatedTarget = { ...target, shield: target.shield + amount };
  return updateDigimonInState(gameState, updatedTarget);
}

function applyHeal(amount: number, target: DigimonState, gameState: GameState): GameState {
  const updatedTarget = { ...target, hp: Math.min(target.maxHp, target.hp + amount) };
  return updateDigimonInState(gameState, updatedTarget);
}

function applyStatusEffect(statusEffect: StatusEffect | CardEffect['applyStatus'], target: DigimonState, gameState: GameState): GameState {
  if (!statusEffect) return gameState;

  const effect: StatusEffect = {
    type: statusEffect.type,
    duration: statusEffect.duration,
    value: statusEffect.value ?? 1, // Default to 1 if value is not provided
    isResistable: 'isResistable' in statusEffect ? statusEffect.isResistable : true // Default to true if isResistable is not provided
  };
  
  if (!effect.isResistable || Math.random() > target.corruptionResistance) {
    const updatedStatusEffects = [...target.statusEffects, effect];
    const updatedTarget = { ...target, statusEffects: updatedStatusEffects };
    return updateDigimonInState(gameState, updatedTarget);
  }
  
  return gameState;
}

function drawCards(amount: number, gameState: GameState): GameState {
  const drawnCards = gameState.player.deck.slice(0, amount);
  const newDeck = gameState.player.deck.slice(amount);
  const newHand = [...gameState.player.hand, ...drawnCards];
  
  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: newHand,
      deck: newDeck
    }
  };
}

function discardCards(amount: number | 'all', gameState: GameState): GameState {
  if (amount === 'all') {
    const discardedCards = [...gameState.player.hand];
    return {
      ...gameState,
      player: {
        ...gameState.player,
        hand: [],
        discardPile: [...gameState.player.discardPile, ...discardedCards]
      },
      cardsDiscardedThisTurn: gameState.cardsDiscardedThisTurn + discardedCards.length,
      cardsDiscardedThisBattle: gameState.cardsDiscardedThisBattle + discardedCards.length
    };
  } else {
    const discardedCards = gameState.player.hand.slice(0, amount);
    const newHand = gameState.player.hand.slice(amount);
    const newDiscardPile = [...gameState.player.discardPile, ...discardedCards];
    
    return {
      ...gameState,
      player: {
        ...gameState.player,
        hand: newHand,
        discardPile: newDiscardPile
      },
      cardsDiscardedThisTurn: gameState.cardsDiscardedThisTurn + discardedCards.length,
      cardsDiscardedThisBattle: gameState.cardsDiscardedThisBattle + discardedCards.length
    };
  }
}

function gainEnergy(amount: number, gameState: GameState): GameState {
  return {
    ...gameState,
    player: {
      ...gameState.player,
      energy: gameState.player.energy + amount
    }
  };
}

function gainEnergyFromDiscardedCards(amount: number | 'discardedCardCost' | 'discardedCardCount', gameState: GameState): GameState {
  let energyGain = 0;
  if (amount === 'discardedCardCost') {
    energyGain = gameState.player.discardPile.reduce((total, card) => total + card.cost, 0);
  } else if (amount === 'discardedCardCount') {
    energyGain = gameState.cardsDiscardedThisTurn;
  } else {
    energyGain = amount;
  }
  
  return gainEnergy(energyGain, gameState);
}

function removeEnemyShield(gameState: GameState): GameState {
  const updatedEnemyDigimon = gameState.enemy.digimon.map(digimon => ({ ...digimon, shield: 0 }));
  return {
    ...gameState,
    enemy: {
      ...gameState.enemy,
      digimon: updatedEnemyDigimon
    }
  };
}

function removeAllShield(gameState: GameState): GameState {
  const updatedPlayerDigimon = gameState.player.digimon.map(digimon => ({ ...digimon, shield: 0 }));
  const updatedEnemyDigimon = gameState.enemy.digimon.map(digimon => ({ ...digimon, shield: 0 }));
  return {
    ...gameState,
    player: {
      ...gameState.player,
      digimon: updatedPlayerDigimon
    },
    enemy: {
      ...gameState.enemy,
      digimon: updatedEnemyDigimon
    }
  };
}

function removeAilments(gameState: GameState): GameState {
  const updatedPlayerDigimon = gameState.player.digimon.map(digimon => ({ ...digimon, statusEffects: [] }));
  return {
    ...gameState,
    player: {
      ...gameState.player,
      digimon: updatedPlayerDigimon
    }
  };
}

function modifyCost(modifyCostEffect: CardEffect['modifyCost'], gameState: GameState): GameState {
  if (!modifyCostEffect) return gameState;

  const { target, cardId, amount, duration } = modifyCostEffect;
  let updatedHand = gameState.player.hand.map(card => {
    if ((target === 'all') || (target === 'specific' && card.id === cardId)) {
      return { ...card, cost: Math.max(0, card.cost + amount) };
    }
    return card;
  });

  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: updatedHand
    },
    temporaryEffects: {
      ...gameState.temporaryEffects,
      costModifications: [
        ...(gameState.temporaryEffects.costModifications || []),
        { target, cardId, amount, duration, turnsRemaining: duration }
      ]
    }
  };
}


function modifyStatMultiplier(modifyStatEffect: CardEffect['modifyStatMultiplier'], gameState: GameState): GameState {
  if (!modifyStatEffect) return gameState;

  const { stat, multiplier, duration } = modifyStatEffect;
  return {
    ...gameState,
    temporaryEffects: {
      ...gameState.temporaryEffects,
      statMultipliers: [
        ...(gameState.temporaryEffects.statMultipliers || []),
        { stat, multiplier, duration, turnsRemaining: duration } as {
          stat: StatType;
          multiplier: number;
          duration: number;
          turnsRemaining: number;
        }
      ]
    }
  };
}


function applyScalingEffect(scalingEffect: CardEffect['scaling'], gameState: GameState, targetInfo: TargetInfo): GameState {
  if (!scalingEffect) return gameState;

  const { factor, effect } = scalingEffect;
  const scalingValue = getScalingValue(factor, gameState, targetInfo.sourceDigimonIndex);
  const scaledEffect = effect(scalingValue);

  return resolveCardEffects({ effects: [scaledEffect] } as Card, gameState, targetInfo);
}

function getScalingValue(factor: ScalingFactor, gameState: GameState, sourceDigimonIndex: number): number {
  switch (factor) {
    case 'enemiesHit':
      return gameState.enemy.digimon.length;
    case 'drawnCardsCost':
      return gameState.player.hand.reduce((total, card) => total + card.cost, 0);
    case 'cardsDiscardedThisTurn':
      return gameState.cardsDiscardedThisTurn;
      case 'userShield':
        return gameState.player.digimon[sourceDigimonIndex].shield;
      case 'discardedCardCount':
        return gameState.cardsDiscardedThisTurn;
      case 'cardsDiscardedThisBattle':
        return gameState.cardsDiscardedThisBattle;
      default:
        return 0;
    }
}

function applyBurst(card: Card, gameState: GameState): GameState {
  const updatedHand = gameState.player.hand.filter(c => c.id !== card.id);
  const burstCards = [...(gameState.temporaryEffects.burstCards || []), card];

  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: updatedHand
    },
    temporaryEffects: {
      ...gameState.temporaryEffects,
      burstCards
    }
  };
}

function applyRecompile(card: Card, gameState: GameState): GameState {
  // Add the card back to the player's hand
  const updatedHand = [...gameState.player.hand, card];

  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: updatedHand
    }
  };
}

function updateDigimonInState(gameState: GameState, updatedDigimon: DigimonState): GameState {
  const isPlayerDigimon = gameState.player.digimon.some(d => d.id === updatedDigimon.id);
  if (isPlayerDigimon) {
    return {
      ...gameState,
      player: {
        ...gameState.player,
        digimon: gameState.player.digimon.map(d => d.id === updatedDigimon.id ? updatedDigimon : d)
      }
    };
  } else {
    return {
      ...gameState,
      enemy: {
        ...gameState.enemy,
        digimon: gameState.enemy.digimon.map(d => d.id === updatedDigimon.id ? updatedDigimon : d)
      }
    };
  }
}

// Placeholder functions for combo, scaling, and conditional effects
// These should be implemented based on your game's specific rules
function checkCombo(card: Card, gameState: GameState): CardEffect | null {
  // Implement combo logic
  return null;
}

function applyScaling(card: Card, gameState: GameState): CardEffect {
  // Implement scaling logic
  return {};
}

function checkConditional(card: Card, gameState: GameState): CardEffect | null {
  // Implement conditional logic
  return null;
}

function applyConsumable(card: Card, gameState: GameState): GameState {
  // Implement consumable logic
  return gameState;
}

function calculateDamage(formula: string, attacker: DigimonState, gameState: GameState): number {

  // uniques
  if (formula.includes('cardsDiscardedThisBattle')) {
    const [baseDamage, multiplier] = formula.split('*').map(part => part.trim());
    const baseValue = parseInt(baseDamage);
    if (multiplier === 'cardsDiscardedThisBattle') {
      return baseValue * gameState.cardsDiscardedThisBattle;
    }
  }

  // other formulas
  if (formula === 'attack') {
    return attacker.attack;
  }
  // If no specific formula is matched, return the attacker's base attack
  return attacker.attack;
}

function handleScaling(effect: CardEffect, gameState: GameState, targetInfo: TargetInfo): GameState {
  if (effect.scaling) {
    const scalingValue = getScalingValue(effect.scaling.factor, gameState, targetInfo.sourceDigimonIndex);
    const scaledEffect = effect.scaling.effect(scalingValue);
    return resolveCardEffects({ effects: [scaledEffect] } as Card, gameState, targetInfo);
  }
  return gameState;
}


function endOfBattleCleanup(gameState: GameState): GameState {
  const updatedDeck = [...gameState.player.deck, ...(gameState.temporaryEffects.burstCards || [])];

  return {
    ...gameState,
    player: {
      ...gameState.player,
      deck: updatedDeck
    },
    temporaryEffects: {
      ...gameState.temporaryEffects,
      burstCards: [],
      costModifications: [],
      statMultipliers: []
    }
  };
}

export {
  resolveCardEffects,
  applyDamage,
  applyShield,
  applyHeal,
  drawCards,
  discardCards,
  gainEnergy,
  removeEnemyShield,
  removeAllShield,
  removeAilments,
  endOfBattleCleanup
};