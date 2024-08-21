export const STARTING_RAM = 3;
export const BASE_RAM = 3;
export const MAX_HAND_SIZE = 7;
export const CARDS_DRAWN_PER_TURN = 1;
export const MAX_RAM = 10;
export const EXPERIENCE_PER_LEVEL = 100;


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

export const CORRUPTION_DAMAGE_PER_STACK = 5; // Moved from types.ts to here