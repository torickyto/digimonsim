import { 
  GameState, 
  Card, 
  CardEffect, 
  TargetInfo, 
  DigimonState,
  Digimon,
  StatusEffect,
  StatusEffectType,
  ScalingFactor,
  StatType,
  DamageFormulaKey
} from '../shared/types';
import { CORRUPTION_DAMAGE_PER_STACK } from '../game/gameConstants';
import { DamageCalculations } from '../shared/damageCalculations';

function isDamageEffect(effect: CardEffect): effect is CardEffect & { damage: NonNullable<CardEffect['damage']> } {
  return effect.damage !== undefined && effect.damage.formula !== undefined && effect.damage.target !== undefined;
}

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
  let enemiesHit = 0;
  const sourceDigimon = updatedState.player.digimon[targetInfo.sourceDigimonIndex];
  const targets = getTargets(updatedState, targetInfo);

  card.effects.forEach(effect => {
    if (effect.once && updatedState.temporaryEffects.onceEffectsUsed?.includes(card.id)) {
      return;
    }

    if (effect.duration) {
      updatedState = applyDurationEffect(effect, updatedState, targets);
    }

    if (effect.once) {
      updatedState.temporaryEffects.onceEffectsUsed = [
        ...(updatedState.temporaryEffects.onceEffectsUsed || []),
        card.id
      ];
    }

    if (effect.shield && effect.shield.formula) {
      const shieldAmount = DamageCalculations[effect.shield.formula](updatedState.player.digimon[targetInfo.sourceDigimonIndex]);
      const shieldTargets = getTargets(updatedState, { ...targetInfo, targetType: effect.shield.target });
      shieldTargets.forEach(target => {
        updatedState = applyShield(shieldAmount, target, updatedState);
      });
    }
    
    if (isDamageEffect(effect)) {
      const damage = DamageCalculations[effect.damage.formula](updatedState.player.digimon[targetInfo.sourceDigimonIndex]);
      const damageTargets = getTargets(updatedState, { ...targetInfo, targetType: effect.damage.target });
      damageTargets.forEach(target => {
        updatedState = applyDamage(damage, target, updatedState, {
          ...targetInfo,
          targetType: effect.damage.target,
          targetDigimonIndex: updatedState.enemy.digimon.findIndex(d => d.id === target.id)
        });
        if (target.hp > 0 && effect.damage.target === 'enemy') enemiesHit++;
      });
    }

    

    if (effect.shield && effect.shield.formula) {
      let shieldAmount = DamageCalculations[effect.shield.formula](updatedState.player.digimon[targetInfo.sourceDigimonIndex]);
      
      if (effect.scaling && effect.scaling.factor === 'enemiesHit') {
        const scalingValue = getScalingValue(effect.scaling.factor, updatedState, targetInfo.sourceDigimonIndex, enemiesHit);
        const scaledEffect = effect.scaling.effect(scalingValue);
        if (scaledEffect.shield && scaledEffect.shield.formula) {
          shieldAmount *= scalingValue;
        }
      }

      const shieldTargets = getTargets(updatedState, { ...targetInfo, targetType: effect.shield.target });
      shieldTargets.forEach(target => {
        updatedState = applyShield(shieldAmount, target, updatedState);
      });
    }

    if (effect.heal && effect.heal.formula) {
      const healAmount = DamageCalculations[effect.heal.formula](updatedState.player.digimon[targetInfo.sourceDigimonIndex]);
      const healTargets = getTargets(updatedState, { ...targetInfo, targetType: effect.heal.target });
      healTargets.forEach(target => {
        updatedState = applyHeal(healAmount, target, updatedState);
      });
    }

    if (effect.repeat) {
      for (let i = 0; i < effect.repeat; i++) {
        updatedState = resolveCardEffects({ ...card, effects: [{ ...effect, repeat: undefined }] }, updatedState, targetInfo);
      }
    }

    if (effect.scaling) {
      updatedState = handleScaling(effect, updatedState, targetInfo, enemiesHit);
    }

    if (effect.applyStatus) {
      targets.forEach(target => {
        if (effect.applyStatus) { 
          updatedState = applyStatusEffect(effect.applyStatus, target, updatedState);
        }
      });
    }

    if (effect.drawCards) updatedState = drawCards(effect.drawCards, updatedState);

    if (effect.discardCards) {
      updatedState = discardCards(effect.discardCards, updatedState);
      if (effect.gainRam === 'discardedCardCost') {
        const discardedCard = updatedState.player.discardPile[updatedState.player.discardPile.length - 1];
        if (discardedCard) {
          updatedState = gainRam(discardedCard.cost, updatedState);
        }
      }
    }

    if (typeof effect.gainRam === 'number') {
      updatedState = gainRam(effect.gainRam, updatedState);
    }

    if (effect.gainRam !== undefined) {
      updatedState = gainRamFromDiscardedCards(effect.gainRam, updatedState);
    }

    if (effect.removeEnemyShield) updatedState = removeEnemyShield(updatedState);
    if (effect.removeAllShield) updatedState = removeAllShield(updatedState);
    if (effect.removeAilments) updatedState = removeAilments(updatedState);
    if (effect.modifyCost) updatedState = modifyCost(effect.modifyCost, updatedState);
    if (effect.modifyStatMultiplier) updatedState = modifyStatMultiplier(effect.modifyStatMultiplier, updatedState);
    if (effect.scaling) updatedState = applyScalingEffect(effect.scaling, updatedState, targetInfo, enemiesHit);
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

function applyDurationEffect(effect: CardEffect, gameState: GameState, targets: DigimonState[]): GameState {
  let updatedState = { ...gameState };

  targets.forEach(target => {
    const newEffect: StatusEffect = {
      type: effect.description as StatusEffectType, // description can be used as the effect type
      duration: effect.duration || 1,
      value: 1, // Default value, adjust as needed
    };

    const updatedTarget = {
      ...target,
      statusEffects: [...target.statusEffects, newEffect]
    };

    updatedState = updateDigimonInState(updatedState, updatedTarget);
  });

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

function applyStatusEffect(statusEffect: StatusEffect | NonNullable<CardEffect['applyStatus']>, target: DigimonState, gameState: GameState): GameState {
  if (!statusEffect) return gameState;

  const effect: StatusEffect = {
    type: 'type' in statusEffect && statusEffect.type ? statusEffect.type :
          'description' in statusEffect && statusEffect.description ? statusEffect.description as StatusEffectType :
          'UNKNOWN' as StatusEffectType,
    duration: statusEffect.duration,
    value: 'value' in statusEffect && statusEffect.value !== undefined ? statusEffect.value : 1,
    isResistable: 'isResistable' in statusEffect ? statusEffect.isResistable : true
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

function gainRam(amount: number, gameState: GameState): GameState {
  return {
    ...gameState,
    player: {
      ...gameState.player,
      ram: gameState.player.ram + amount
    }
  };
}

function gainRamFromDiscardedCards(amount: number | 'discardedCardCost' | 'discardedCardCount', gameState: GameState): GameState {
  let ramGain = 0;
  if (amount === 'discardedCardCost') {
    ramGain = gameState.player.discardPile.reduce((total, card) => total + card.cost, 0);
  } else if (amount === 'discardedCardCount') {
    ramGain = gameState.cardsDiscardedThisTurn;
  } else {
    ramGain = amount;
  }
  
  return gainRam(ramGain, gameState);
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


function applyScalingEffect(scalingEffect: CardEffect['scaling'], gameState: GameState, targetInfo: TargetInfo, enemiesHit: number): GameState {
  if (!scalingEffect) return gameState;

  const { factor, effect } = scalingEffect;
  const scalingValue = getScalingValue(factor, gameState, targetInfo.sourceDigimonIndex, enemiesHit);
  const scaledEffect = effect(scalingValue);

  return resolveCardEffects({ effects: [scaledEffect] } as Card, gameState, targetInfo);
}

function getScalingValue(factor: ScalingFactor, gameState: GameState, sourceDigimonIndex: number, value: number): number {
  switch (factor) {
    case 'enemiesHit':
      return value;
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
        return 1;
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
        digimon: gameState.player.digimon.map(d => 
          d.id === updatedDigimon.id ? { ...d, ...updatedDigimon } as Digimon : d
        )
      }
    };
  } else {
    return {
      ...gameState,
      enemy: {
        ...gameState.enemy,
        digimon: gameState.enemy.digimon.map(d => 
          d.id === updatedDigimon.id ? updatedDigimon : d
        )
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
  return {
    description: "Applied scaling effect",
  };
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

function handleScaling(effect: CardEffect, gameState: GameState, targetInfo: TargetInfo, enemiesHit: number): GameState {
  if (effect.scaling) {
    const scalingValue = getScalingValue(effect.scaling.factor, gameState, targetInfo.sourceDigimonIndex, enemiesHit);
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
      statMultipliers: [],
      onceEffectsUsed: []
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
  gainRam,
  removeEnemyShield,
  removeAllShield,
  removeAilments,
  endOfBattleCleanup
};