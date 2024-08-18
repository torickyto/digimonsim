import { CardTemplate, GameState, Digimon } from './types';

export const applyCardEffect = (card: CardTemplate, gameState: GameState, target: Digimon): GameState => {
  let newState = { ...gameState };

  card.effects.forEach(effect => {
    if (effect.damage) {
      target.hp -= effect.damage;
    }
    if (effect.block) {
      if (card.target === 'self') {
        newState.player.digimon[0].block += effect.block;
      } else {
        target.block += effect.block;
      }
    }
    if (effect.heal) {
      if (card.target === 'self') {
        newState.player.digimon[0].hp = Math.min(newState.player.digimon[0].hp + effect.heal, newState.player.digimon[0].maxHp);
      } else {
        target.hp = Math.min(target.hp + effect.heal, target.maxHp);
      }
    }
    if (effect.drawCards) {

    }
    if (effect.discardCards) {

    }
    if (effect.gainEnergy) {
      newState.player.energy += effect.gainEnergy;
    }
    if (effect.removeEnemyBlock) {
      target.block = 0;
    }
    if (effect.customEffect) {
      newState = effect.customEffect(newState);
    }
  });

  return newState;
};

export const playCard = (card: CardTemplate, gameState: GameState, targetIndex: number): GameState => {
  let newState = { ...gameState };
  
  // Deduct energy cost
  newState.player.energy -= card.cost;

  // Apply effects based on target
  switch (card.target) {
    case 'self':
      newState = applyCardEffect(card, newState, newState.player.digimon[0]);
      break;
    case 'enemy':
      newState = applyCardEffect(card, newState, newState.enemy.digimon[targetIndex]);
      break;
    case 'all_enemies':
      newState.enemy.digimon.forEach(enemy => {
        newState = applyCardEffect(card, newState, enemy);
      });
      break;
    // ... handle other target types
  }

  // Move card from hand to discard pile
  const cardIndex = newState.player.hand.findIndex(c => c.id === card.id);
  if (cardIndex !== -1) {
    const [playedCard] = newState.player.hand.splice(cardIndex, 1);
    newState.player.discardPile.push(playedCard);
  }

  return newState;
};