import { Digimon, DigimonTemplate } from '../shared/types';
import { createUniqueDigimon } from './digimon';
import { getDigimonTemplate } from './DigimonTemplate';

interface EnemyPool {
  [key: string]: {
    normal_enemies: string[];
    hard_enemies: string[];
    bosses: string[];
  };
}

const enemyPool: EnemyPool = {
  'Label Forest': {
    normal_enemies: ['minomon', 'chicchimon', 'pagumon', 'gummymon', 'koromon', 'tsunomon', 'goblimon', 'tokomon', 'budmon', 'kunemon', 'mushmon'],
    hard_enemies: ['veggiemon', 'mushmon', 'kunemon', 'tentomon', 'goblimon'],
    bosses: ['kuwagamon']
  },
  // Add more zones here as they are implemented
};

export const getEnemiesForZone = (zoneName: string, nodeType: 'normal_enemy' | 'hard_enemy' | 'boss'): string[] => {
  const zoneEnemies = enemyPool[zoneName];
  if (!zoneEnemies) {
    console.error(`No enemies defined for zone: ${zoneName}`);
    return [];
  }
  switch (nodeType) {
    case 'normal_enemy':
      return zoneEnemies.normal_enemies;
    case 'hard_enemy':
      return zoneEnemies.hard_enemies;
    case 'boss':
      return zoneEnemies.bosses;
    default:
      return [];
  }
};

export const generateEnemy = (zoneName: string, nodeType: 'normal_enemy' | 'hard_enemy' | 'boss', playerLevel: number): Digimon | null => {
  const potentialEnemies = getEnemiesForZone(zoneName, nodeType);
  if (potentialEnemies.length === 0) return null;

  const randomEnemyName = potentialEnemies[Math.floor(Math.random() * potentialEnemies.length)];
  const enemyTemplate = getDigimonTemplate(randomEnemyName);
  
  if (!enemyTemplate) {
    console.error(`No template found for enemy: ${randomEnemyName}`);
    return null;
  }

  let enemyLevel = playerLevel;
  switch (nodeType) {
    case 'normal_enemy':
      enemyLevel = playerLevel + Math.floor(Math.random() * 2) - 1; // -1 to +1 level difference
      break;
    case 'hard_enemy':
      enemyLevel = playerLevel + Math.floor(Math.random() * 2) + 1; // +1 to +2 level difference
      break;
    case 'boss':
      enemyLevel = playerLevel + 2;
      break;
  }

  return createUniqueDigimon(randomEnemyName, enemyLevel);
};

export const generateEnemyTeam = (zoneName: string, nodeType: 'normal_enemy' | 'hard_enemy' | 'boss', playerLevel: number, teamSize: number): Digimon[] => {
  const enemyTeam: Digimon[] = [];
  for (let i = 0; i < teamSize; i++) {
    const enemy = generateEnemy(zoneName, nodeType, playerLevel);
    if (enemy) enemyTeam.push(enemy);
  }
  return enemyTeam;
};