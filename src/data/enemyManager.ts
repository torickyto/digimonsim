import { Digimon, DigimonTemplate } from '../shared/types';
import { createUniqueDigimon } from './digimon';
import { getDigimonTemplate } from './DigimonTemplate';

interface EnemyPool {
  [key: string]: {
    enemies: string[];
    bosses: string[];
  };
}

const enemyPool: EnemyPool = {
  'Label Forest': {
    enemies: ['koromon', 'tokomon'],
    bosses: ['greymon', 'garurumon']
  },
  // Add more zones here as they are implemented
};

export const getEnemiesForZone = (zoneName: string, nodeType: 'monster' | 'boss'): string[] => {
  const zoneEnemies = enemyPool[zoneName];
  if (!zoneEnemies) {
    console.error(`No enemies defined for zone: ${zoneName}`);
    return [];
  }
  return nodeType === 'boss' ? zoneEnemies.bosses : zoneEnemies.enemies;
};

export const generateEnemy = (zoneName: string, nodeType: 'monster' | 'boss', playerLevel: number): Digimon | null => {
  const potentialEnemies = getEnemiesForZone(zoneName, nodeType);
  if (potentialEnemies.length === 0) return null;

  const randomEnemyName = potentialEnemies[Math.floor(Math.random() * potentialEnemies.length)];
  const enemyTemplate = getDigimonTemplate(randomEnemyName);
  
  if (!enemyTemplate) {
    console.error(`No template found for enemy: ${randomEnemyName}`);
    return null;
  }

  const enemyLevel = nodeType === 'boss' ? playerLevel + 2 : playerLevel;
  return createUniqueDigimon(randomEnemyName, enemyLevel);
};

export const generateEnemyTeam = (zoneName: string, nodeType: 'monster' | 'boss', playerLevel: number, teamSize: number): Digimon[] => {
  const enemyTeam: Digimon[] = [];
  for (let i = 0; i < teamSize; i++) {
    const enemy = generateEnemy(zoneName, nodeType, playerLevel);
    if (enemy) enemyTeam.push(enemy);
  }
  return enemyTeam;
};