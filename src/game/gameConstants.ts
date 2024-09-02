export const STARTING_RAM = 3;
export const BASE_RAM = 3;
export const MAX_HAND_SIZE = 9;
export const CARDS_DRAWN_PER_TURN = 1;
export const MAX_RAM = 10;
export const BASE_EXP_REQUIREMENT = 100;
export const EXP_SCALE_FACTOR = 1.5;
export const MAX_LEVEL = 100;
export const ENEMY_DEFEAT_EXP_BASE = 20;
export const ENEMY_DEFEAT_EXP_LEVEL_FACTOR = 5;


export const STATUS_EFFECT_DURATIONS = {
  CORRUPTION: 3, // Corruption is stackable, so this is the duration of each stack
  BUGGED: 1, // Bugged (stun) lasts for one turn
  TAUNT: 2, // Taunt lasts for two turns
};

export const DAMAGE_MULTIPLIERS = {
  CRITICAL_HIT: 1.5,
  TYPE_ADVANTAGE: 1.25,
  TYPE_DISADVANTAGE: 0.75,
};

export const CORRUPTION_DAMAGE_PER_STACK = 2; 