import { DigimonState } from './types';
import { DAMAGE_MULTIPLIERS } from '../game/gameConstants';

export type DamageFormula = (attacker: DigimonState) => number;

export const DamageCalculations: Record<string, DamageFormula> = {
    LIGHT: (attacker: DigimonState) => Math.round(attacker.attack * 0.2),
    
    WEAK: (attacker: DigimonState) => Math.round(attacker.attack * 0.5),
  
    BASIC: (attacker: DigimonState) => attacker.attack,
  
    STRONG: (attacker: DigimonState) => Math.round(attacker.attack * 1.5),

    HEAVY: (attacker: DigimonState) => Math.round(attacker.attack * 2),
  
    MEGA: (attacker: DigimonState) => Math.round(attacker.attack * 3),
  
    CRITICAL_ATTACK: (attacker: DigimonState) => 
      Math.round(attacker.attack * DAMAGE_MULTIPLIERS.CRITICAL_HIT),
  
    HEALING_ATTACK: (attacker: DigimonState) => 
      Math.round(attacker.healing * 0.5),
};

export function calculateDamage(formulaKey: string, attacker: DigimonState): number {
  const formula = DamageCalculations[formulaKey];
  if (!formula) {
    console.error(`No damage formula found for key: ${formulaKey}`);
    return 0;
  }
  return formula(attacker);
}