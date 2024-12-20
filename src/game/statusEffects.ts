import { DigimonState, StatusEffect, StatusEffectType, GameState } from '../shared/types';
import { STATUS_EFFECT_DURATIONS, CORRUPTION_DAMAGE_PER_STACK } from './gameConstants';

export const addStatusEffect = (digimon: DigimonState, effect: StatusEffect): DigimonState => {
  const existingEffectIndex = digimon.statusEffects.findIndex(e => e.type === effect.type);
  
  if (existingEffectIndex !== -1) {
    const updatedEffects = [...digimon.statusEffects];
    if (effect.type === 'corruption') {
      updatedEffects[existingEffectIndex] = {
        ...updatedEffects[existingEffectIndex],
        value: updatedEffects[existingEffectIndex].value + 1,
        duration: STATUS_EFFECT_DURATIONS.CORRUPTION
      };
    } else {
      updatedEffects[existingEffectIndex] = {
        ...updatedEffects[existingEffectIndex],
        duration: Math.max(updatedEffects[existingEffectIndex].duration, effect.duration),
        value: effect.value,
        source: effect.source,
        isResistable: effect.isResistable
      };
    }
    return { ...digimon, statusEffects: updatedEffects };
  } else {
    const newEffect: StatusEffect = {
      ...effect,
      duration: STATUS_EFFECT_DURATIONS[effect.type.toUpperCase() as keyof typeof STATUS_EFFECT_DURATIONS],
      value: effect.type === 'corruption' ? 1 : effect.value
    };
    return {
      ...digimon,
      statusEffects: [...digimon.statusEffects, newEffect]
    };
  }
};

export const removeStatusEffect = (digimon: DigimonState, effectType: StatusEffectType): DigimonState => {
  return {
    ...digimon,
    statusEffects: digimon.statusEffects.filter(effect => effect.type !== effectType)
  };
};

export const updateStatusEffects = (digimon: DigimonState): DigimonState => {
  const updatedEffects = digimon.statusEffects
    .map(effect => ({
      ...effect,
      duration: effect.duration > 0 ? effect.duration - 1 : 0
    }))
    .filter(effect => effect.duration > 0);

  return { ...digimon, statusEffects: updatedEffects };
};

export const applyStatusEffects = (digimon: DigimonState): DigimonState => {
  let updatedDigimon = { ...digimon };
  let updatedStatusEffects: StatusEffect[] = [];

  for (const effect of updatedDigimon.statusEffects) {
    switch (effect.type) {
      case 'corruption':
        updatedDigimon.hp -= effect.value * CORRUPTION_DAMAGE_PER_STACK;
        updatedStatusEffects.push(effect); // Keep corruption without reducing duration
        break;
      case 'bugged':
        // Bugged (stun) is handled in the battle logic, not here
        break;
        case 'taunt':
          if (effect.duration > 1) {
            updatedStatusEffects.push({ ...effect, duration: effect.duration - 1 });
          }
          break;
    }
  }

  updatedDigimon.statusEffects = updatedDigimon.statusEffects
  .map(effect => ({
    ...effect,
    duration: effect.type === 'corruption' ? effect.duration : effect.duration - 1
  }))
  .filter(effect => effect.duration > 0 || effect.type === 'corruption');

  return { ...updatedDigimon, statusEffects: updatedStatusEffects };
};

export const hasStatusEffect = (digimon: DigimonState, effectType: StatusEffectType): boolean => {
  return digimon.statusEffects.some(effect => effect.type === effectType);
};

export const isStunned = (digimon: DigimonState): boolean => {
  return digimon.statusEffects.some(effect => effect.type === 'bugged');
};

export const getTauntSource = (digimon: DigimonState): number | undefined => {
  const tauntEffect = digimon.statusEffects.find(effect => effect.type === 'taunt');
  return tauntEffect?.source;
};

  /*
   This function should be used in battle logic once created to determine valid targets
export const getValidTargets = (gameState: GameState, attacker: Digimon): number[] => {
  const tauntSource = getTauntSource(attacker);
  if (tauntSource !== undefined) {
    return [tauntSource];
  }
  // Return all enemy Digimon IDs if not taunted
  return gameState.enemy.digimon.map(d => d.id);
}; */