// cardEffects.ts

import { 
  GameState, 
  Card, 
  CardEffect, 
  TargetInfo, 
  DigimonState,
  StatusEffect,
  StatusEffectType
} from '../shared/types';
import { CORRUPTION_DAMAGE_PER_STACK } from '../game/gameConstants';

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
      const damage = calculateDamage(effect.damage.formula, updatedState.player.digimon[targetInfo.sourceDigimonIndex], updatedState);
      
      if (effect.damage.target === 'random_enemy') {
        const numberOfEnemies = updatedState.enemy.digimon.length;
        for (let i = 0; i < numberOfEnemies; i++) {
          const randomIndex = Math.floor(Math.random() * updatedState.enemy.digimon.length);
          updatedState = applyDamage(damage, updatedState.enemy.digimon[randomIndex], updatedState, targetInfo);
        }
      } else {
        targets.forEach(target => {
          updatedState = applyDamage(damage, target, updatedState, targetInfo);
        });
      }
    }

    if (effect.shield !== undefined) {
      targets.forEach(target => {
        updatedState = applyShield(effect.shield!, target, updatedState);
      });
    }

    if (effect.heal !== undefined) {
      targets.forEach(target => {
        updatedState = applyHeal(effect.heal!, target, updatedState);
      });
    }

    if (effect.applyStatus) {
      targets.forEach(target => {
        updatedState = applyStatusEffect(effect.applyStatus, target, updatedState);
      });
    }

    // Handle effects that don't require targets
    if (effect.drawCards) updatedState = drawCards(effect.drawCards, updatedState);
    if (effect.discardCards) updatedState = discardCards(effect.discardCards, updatedState);
    if (effect.gainEnergy) updatedState = gainEnergy(effect.gainEnergy, updatedState);
    if (effect.removeEnemyShield) updatedState = removeEnemyShield(updatedState);
    if (effect.removeAllShield) updatedState = removeAllShield(updatedState);
    if (effect.removeAilments) updatedState = removeAilments(updatedState);
  });

  // Apply combo, scaling, and conditional effects
  const comboEffect = checkCombo(card, updatedState);
  if (comboEffect) {
    updatedState = resolveCardEffects({ ...card, effects: [comboEffect] }, updatedState, targetInfo);
  }

  const scaledEffect = applyScaling(card, updatedState);
  if (Object.keys(scaledEffect).length > 0) {
    updatedState = resolveCardEffects({ ...card, effects: [scaledEffect] }, updatedState, targetInfo);
  }

  const conditionalEffect = checkConditional(card, updatedState);
  if (conditionalEffect) {
    updatedState = resolveCardEffects({ ...card, effects: [conditionalEffect] }, updatedState, targetInfo);
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

function applyStatusEffect(statusEffect: CardEffect['applyStatus'], target: DigimonState, gameState: GameState): GameState {
  if (!statusEffect) return gameState;
  
  const updatedStatusEffects = [...target.statusEffects, statusEffect];
  const updatedTarget = { ...target, statusEffects: updatedStatusEffects };
  return updateDigimonInState(gameState, updatedTarget);
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

function discardCards(amount: number, gameState: GameState): GameState {
  const discardedCards = gameState.player.hand.slice(0, amount);
  const newHand = gameState.player.hand.slice(amount);
  const newDiscardPile = [...gameState.player.discardPile, ...discardedCards];
  
  return {
    ...gameState,
    player: {
      ...gameState.player,
      hand: newHand,
      discardPile: newDiscardPile
    }
  };
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

function applyBurst(card: Card, gameState: GameState): GameState {
  // Implement burst logic
  return gameState;
}

function applyRecompile(card: Card, gameState: GameState): GameState {
  // Implement recompile logic
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
  removeAilments
};