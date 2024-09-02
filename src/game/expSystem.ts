import { Digimon } from '../shared/types';
import { BASE_EXP_REQUIREMENT, EXP_SCALE_FACTOR, MAX_LEVEL, ENEMY_DEFEAT_EXP_BASE, ENEMY_DEFEAT_EXP_LEVEL_FACTOR } from './gameConstants';
import { levelUpDigimon } from '../data/digimon';

export function calculateExpRequirement(level: number): number {
  const requirement = Math.floor(BASE_EXP_REQUIREMENT * Math.pow(EXP_SCALE_FACTOR, level - 1));
  console.log(`Calculated exp requirement for level ${level}: ${requirement}`);
  return requirement;
}



export function calculateEnemyExpReward(enemyLevel: number): number {
  return ENEMY_DEFEAT_EXP_BASE + (enemyLevel * ENEMY_DEFEAT_EXP_LEVEL_FACTOR);
}