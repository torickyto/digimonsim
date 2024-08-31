/*TEMP LEVEL UP LOGIC*/

export function calculateBaseStat(baseStat: number, level: number): number {
    // temporary stat gain function
    return Math.round(baseStat + (level - 1) * (baseStat * 0.1));
  }

