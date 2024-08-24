import { DigimonState, DamageFormulaKey } from './types';
import { DAMAGE_MULTIPLIERS } from '../game/gameConstants';

export type DamageFormula = (attacker: DigimonState) => number;

export const DamageCalculations: Record<DamageFormulaKey, DamageFormula> = {

    LIGHT: (attacker: DigimonState) => Math.round(attacker.attack * 0.2),

    LIGHT2: (attacker: DigimonState) => Math.round(attacker.attack * 0.33),
    
    WEAK: (attacker: DigimonState) => Math.round(attacker.attack * 0.5),

    WEAK2: (attacker: DigimonState) => Math.round(attacker.attack * 0.75),
  
    BASIC: (attacker: DigimonState) => attacker.attack,

    BASIC2: (attacker: DigimonState) => Math.round(attacker.attack * 1.25),
  
    STRONG: (attacker: DigimonState) => Math.round(attacker.attack * 1.5),

    STRONG2: (attacker: DigimonState) => Math.round(attacker.attack * 1.75),

    HEAVY: (attacker: DigimonState) => Math.round(attacker.attack * 2),

    HEAVY2: (attacker: DigimonState) => Math.round(attacker.attack * 2.5),
  
    MEGA: (attacker: DigimonState) => Math.round(attacker.attack * 3),

    MEGA2: (attacker: DigimonState) => Math.round(attacker.attack * 4),
  
    CRITICAL_ATTACK: (attacker: DigimonState) => 
      Math.round(attacker.attack * DAMAGE_MULTIPLIERS.CRITICAL_HIT),
  
    LIGHT_HEAL: (attacker: DigimonState) => 
      Math.round(attacker.healing * 0.2),

    WEAK_HEAL: (attacker: DigimonState) => 
      Math.round(attacker.healing * 0.5),

    BASIC_HEAL: (attacker: DigimonState) => 
      Math.round(attacker.healing),

    STRONG_HEAL: (attacker: DigimonState) => 
      Math.round(attacker.healing * 1.5),

    HEAVY_HEAL: (attacker: DigimonState) => 
      Math.round(attacker.healing * 2),

    MEGA_HEAL: (attacker: DigimonState) => 
      Math.round(attacker.healing * 3),

    CUSTOM: (attacker: DigimonState, customValue?: number) => customValue || 0
};

export function calculateCustomDamage(attacker: DigimonState, customValue: number): number {
  return customValue;
}

export function calculateDamage(formulaKey: DamageFormulaKey, attacker: DigimonState, defender: DigimonState): number {
  const formula = DamageCalculations[formulaKey];
  if (!formula) {
    console.error(`No damage formula found for key: ${formulaKey}`);
    return 0;
  }
  const damage = formula(attacker);
  console.log('Calculated damage:', damage, 'using formula:', formulaKey);
  return damage;
}