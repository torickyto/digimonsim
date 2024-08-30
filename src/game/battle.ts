import { Digimon, StatusEffect, DigimonState, GameState, Card, BattleAction, TargetInfo, DamageFormulaKey, EnemyAction } from '../shared/types';
import { STARTING_RAM, BASE_RAM, MAX_HAND_SIZE, CARDS_DRAWN_PER_TURN, MAX_RAM } from './gameConstants';
import { DigimonTemplates } from '../data/DigimonTemplate';
import { createDigimon } from '../shared/digimonManager';
import { calculateDamage, DamageCalculations } from '../shared/damageCalculations';
import { applyStatusEffects } from './statusEffects';
import { resolveCardEffects } from './cardEffects';



export const initializeBattle = (playerTeam: Digimon[], enemyTeam: Digimon[]): GameState => {
  console.log('Initializing battle');
  const initialState: GameState = {
    player: {
      digimon: playerTeam.map(digimon => ({ ...digimon })),
      hand: [],
      deck: playerTeam.flatMap((digimon, index) => 
        digimon.deck.map(card => ({ ...card, ownerDigimonIndex: index }))
      ),
      discardPile: [],
      ram: calculateStartingRam(playerTeam),
    },
    enemy: {
      digimon: enemyTeam.map(digimon => ({ ...digimon })),
    },
    turn: 1,  
    phase: 'initial',  // Add a new 'initial' phase
    cardsPlayedThisTurn: 0,
    damageTakenThisTurn: 0,
    removedCards: {},
    cardsDiscardedThisTurn: 0,
    cardsDiscardedThisBattle: 0,
    temporaryEffects: {
      costModifications: [],
      statMultipliers: [],
      burstCards: [],
      onceEffectsUsed: []
    },
    actionQueue: [],
  };

  initialState.player.deck = shuffleDeck(initialState.player.deck);
  console.log('Initial hand size after drawInitialHand:', initialState.player.hand.length);

  return drawInitialHand(initialState);
};

const calculateStartingRam = (playerTeam: Digimon[]): number => {
  let ram = STARTING_RAM;
  playerTeam.forEach(digimon => {
    if (digimon.passiveSkill && typeof digimon.passiveSkill.ramModifier === 'function') {
      ram = digimon.passiveSkill.ramModifier(ram);
    }
  });
  return Math.min(ram, MAX_RAM);
};

const shuffleDeck = (deck: Card[]): Card[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const drawInitialHand = (gameState: GameState): GameState => {
  const cardsToDraw = Math.min(gameState.player.digimon.length + 2, 5);
  console.log('Drawing initial hand, cards to draw:', cardsToDraw);
  let updatedState = { ...gameState };

  for (let i = 0; i < cardsToDraw; i++) {
    const result = drawSingleCard(updatedState);
    updatedState = result.newState;
  }

  console.log('Hand size after drawing initial hand:', updatedState.player.hand.length);
  return updatedState;
};

const drawSingleCard = (gameState: GameState): { newState: GameState; drawnCard: Card | null } => {
  console.log('Drawing single card');
  let newState = { ...gameState };
  let drawnCard: Card | null = null;

  if (newState.player.deck.length === 0) {
    newState.player.deck = shuffleDeck([...newState.player.discardPile]);
    newState.player.discardPile = [];
    newState.actionQueue.push({ type: 'SHUFFLE_DISCARD_TO_DECK' });
  }

  if (newState.player.deck.length > 0) {
    drawnCard = newState.player.deck.pop()!;

    if (newState.player.hand.length < MAX_HAND_SIZE) {
      newState.player.hand.push(drawnCard);
      newState.actionQueue.push({ type: 'DRAW_CARD', card: drawnCard });
      console.log('Card added to hand, new hand size:', newState.player.hand.length);
    } else {
      newState.player.discardPile.push(drawnCard);
      newState.cardsDiscardedThisBattle++;
      newState.actionQueue.push({ type: 'BURN_CARD', card: drawnCard });
      console.log('Card burned due to full hand');
    }
  }

  return { newState, drawnCard };
};

const getAliveDigimon = (digimon: DigimonState[]): DigimonState[] => {
  return digimon.filter(d => d.hp > 0);
};

export const startPlayerTurn = (state: GameState): { updatedState: GameState; drawnCard: Card | null } => {
  console.log('Starting player turn');
  let updatedState = { ...state };

  // Increment the turn counter at the start of the function
  updatedState.turn += 1;
  console.log('Turn:', updatedState.turn);

  // Reset RAM to the starting value
  updatedState.player.ram = calculateStartingRam(updatedState.player.digimon as Digimon[]);

  // Apply RAM modifiers from Digimon abilities or items
  updatedState.player.digimon.forEach(digimon => {
    if (digimon.passiveSkill && typeof digimon.passiveSkill.ramModifier === 'function') {
      updatedState.player.ram = digimon.passiveSkill.ramModifier(updatedState.player.ram);
    }
  });
  updatedState.player.ram = Math.min(updatedState.player.ram, MAX_RAM);

  let drawnCard: Card | null = null;
  // Draw one card if it's not the first turn and there's room in the hand
  if (updatedState.turn > 1 && updatedState.player.hand.length < MAX_HAND_SIZE) {
    console.log('Drawing card at start of turn');
    const result = drawSingleCard(updatedState);
    updatedState = result.newState;
    drawnCard = result.drawnCard;
  } else {
    console.log('Not drawing card: first turn or hand full');
  }

  // Apply any start-of-turn effects
  updatedState = applyStartOfTurnEffects(updatedState);
  updatedState.phase = 'player';

  console.log('Player hand size at end of startPlayerTurn:', updatedState.player.hand.length);
  return { updatedState, drawnCard };
};
    
const applyStartOfTurnEffects = (state: GameState): GameState => {
  let updatedState: GameState = { ...state };

  updatedState.player.digimon = updatedState.player.digimon.map(digimon => ({
    ...digimon,
    statusEffects: digimon.statusEffects
      .map((effect: StatusEffect) => ({
        ...effect,
        duration: effect.duration > 0 ? effect.duration - 1 : effect.duration
      }))
      .filter((effect: StatusEffect) => effect.duration !== 0)
  })) as Digimon[];

  return updatedState;
};

export const playCard = (gameState: GameState, cardIndex: number, targetInfo: TargetInfo): GameState => {
  const card = gameState.player.hand[cardIndex];
  if (!card) {
    throw new Error('Invalid card index');
  }

  const updatedHand = gameState.player.hand.filter((_, index) => index !== cardIndex);

  let updatedState = { 
    ...gameState, 
    player: { 
      ...gameState.player, 
      hand: updatedHand 
    } 
  };

  if (card.type === 'attack') {
    updatedState.actionQueue.push({
      type: 'ANIMATE_ATTACK',
      sourceIndex: targetInfo.sourceDigimonIndex,
      targetIndex: targetInfo.targetDigimonIndex,
      isEnemy: false // This is a player attack
    });
  }

  // Calculate damage and shield separately
  let damage = 0;
  let shield = 0;
  const sourceDigimon = updatedState.player.digimon[targetInfo.sourceDigimonIndex];

  card.effects.forEach(effect => {
    if (effect.damage && effect.damage.formula) {
      damage += DamageCalculations[effect.damage.formula](sourceDigimon);
    }
    if (effect.shield && effect.shield.formula) {
      shield += DamageCalculations[effect.shield.formula](sourceDigimon);
    }
  });

  // Apply shield to the correct target based on the card's effect
  if (shield > 0) {
    const shieldEffect = card.effects.find(effect => effect.shield);
    if (shieldEffect && shieldEffect.shield) {
      const shieldTargetType = shieldEffect.shield.target;
      if (shieldTargetType === 'self' || shieldTargetType === 'single_ally') {
        // Apply shield to player's Digimon
        updatedState.player.digimon = updatedState.player.digimon.map((digimon, index) => 
          index === targetInfo.sourceDigimonIndex 
            ? { ...digimon, shield: digimon.shield + shield }
            : digimon
        );
      } else if (shieldTargetType === 'enemy' && targetInfo.targetType === 'enemy') {
        // Apply shield to enemy Digimon (this case should be rare)
        updatedState.enemy.digimon = updatedState.enemy.digimon.map((digimon, index) => 
          index === targetInfo.targetDigimonIndex 
            ? { ...digimon, shield: digimon.shield + shield }
            : digimon
        );
      }
      // Add more cases here if needed for other target types
    }
  }

  updatedState = {
    ...updatedState,
    player: {
      ...updatedState.player,
      ram: updatedState.player.ram - card.cost,
      discardPile: [...updatedState.player.discardPile, card]
    },
    cardsPlayedThisTurn: updatedState.cardsPlayedThisTurn + 1
  };

  // Apply damage if it's an attack card
  if (damage > 0 && targetInfo.targetType === 'enemy') {
    updatedState = applyDamage(damage, updatedState.enemy.digimon[targetInfo.targetDigimonIndex], updatedState, targetInfo);
  }

  // Add animation-related actions to the queue
  updatedState.actionQueue.push({ 
    type: 'PLAY_CARD', 
    card, 
    targetInfo: { ...targetInfo, sourceDigimonIndex: card.ownerDigimonIndex }
  });

  if (card.type === 'attack' && targetInfo.targetDigimonIndex !== undefined) {
    updatedState.actionQueue.push({
      type: 'ANIMATE_ATTACK',
      sourceIndex: card.ownerDigimonIndex,
      targetIndex: targetInfo.targetDigimonIndex,
      isEnemy: targetInfo.targetType === 'enemy'
    });
  }

  updatedState = resolveCardEffects(card, updatedState, targetInfo);

  return updatedState;
};

export const endPlayerTurn = (gameState: GameState): GameState => {
  return {
    ...gameState,
    phase: 'enemy',
    cardsPlayedThisTurn: 0,
    cardsDiscardedThisTurn: 0,
    actionQueue: [...gameState.actionQueue, { type: 'END_PLAYER_TURN' }]
  };
};

export const executeEnemyTurn = (gameState: GameState): GameState => {
  let updatedState: GameState = { ...gameState };

  console.log('Executing enemy turn');
  console.log('All player Digimon:', updatedState.player.digimon.map(d => `${d.displayName} (HP: ${d.hp})`));

  // Create an array of indices of alive Digimon
  const alivePlayerIndices = updatedState.player.digimon
    .map((d, index) => ({ digimon: d, index }))
    .filter(item => item.digimon.hp > 0)
    .map(item => item.index);

  console.log('Alive player Digimon indices:', alivePlayerIndices);

  if (alivePlayerIndices.length === 0) {
    console.log('No alive player Digimon, skipping enemy turn');
    return updatedState;
  }

  const enemyActions: EnemyAction[] = updatedState.enemy.digimon
    .map((enemyDigimon, enemyIndex) => {
      if (enemyDigimon.hp <= 0) {
        console.log(`Enemy Digimon ${enemyDigimon.displayName} is dead, skipping`);
        return null;
      }

      const randomAliveIndex = Math.floor(Math.random() * alivePlayerIndices.length);
      const targetPlayerIndex = alivePlayerIndices[randomAliveIndex];
      const targetPlayerDigimon = updatedState.player.digimon[targetPlayerIndex];
      
      console.log(`Random alive index selected: ${randomAliveIndex}`);
      console.log(`Target player Digimon: ${targetPlayerDigimon.displayName}`);
      console.log(`Target player index in original array: ${targetPlayerIndex}`);
      
      console.log(`Enemy ${enemyDigimon.displayName} (${enemyIndex}) targeting ${targetPlayerDigimon.displayName} (index: ${targetPlayerIndex})`);
      console.log(`Target Digimon HP: ${targetPlayerDigimon.hp}`);

      const damage = calculateDamage('BASIC' as DamageFormulaKey, enemyDigimon, targetPlayerDigimon);
      console.log(`Calculated damage: ${damage}`);

      return {
        type: 'ENEMY_ACTION' as const,
        attackingEnemyIndex: enemyIndex,
        targetPlayerIndex: targetPlayerIndex,
        damage
      };
    })
    .filter((action): action is EnemyAction => action !== null);

  console.log('Enemy actions:', enemyActions);

  updatedState.actionQueue = [...updatedState.actionQueue, ...enemyActions, { type: 'END_ENEMY_TURN' }];

  console.log('Enemy turn executed, action queue:', updatedState.actionQueue);

  return updatedState;
};

const prepareNextPlayerTurn = (gameState: GameState): GameState => {
  let updatedState: GameState = { ...gameState };

  // Reset RAM to the calculated value based on the team's current state
  updatedState.player.ram = calculateStartingRam(updatedState.player.digimon as Digimon[]);

  // Apply any start-of-turn effects
  updatedState = applyStartOfTurnEffects(updatedState);

  // Set the phase to player's turn
  updatedState.phase = 'player';

  return updatedState;
};

export const drawCard = (state: GameState): { newState: GameState; drawnCard: Card | null } => {
  let newState = { ...state };
  let drawnCard: Card | null = null;

  if (newState.player.deck.length === 0 && newState.player.discardPile.length > 0) {
    // Shuffle discard pile into deck
    newState.player.deck = [...newState.player.discardPile].sort(() => Math.random() - 0.5);
    newState.player.discardPile = [];
    newState.actionQueue.push({ type: 'SHUFFLE_DISCARD_TO_DECK' });
  }

  if (newState.player.deck.length > 0) {
    drawnCard = newState.player.deck.pop()!;
    if (newState.player.hand.length < MAX_HAND_SIZE) {
      newState.player.hand.push(drawnCard);
      newState.actionQueue.push({ type: 'DRAW_CARD', card: drawnCard });
    } else {
      newState.player.discardPile.push(drawnCard);
      newState.cardsDiscardedThisBattle++;
      newState.actionQueue.push({ type: 'BURN_CARD', card: drawnCard });
    }
  }

  return { newState, drawnCard };
};




export const applyDamage = (damage: number, target: Digimon | DigimonState, gameState: GameState, targetInfo: TargetInfo): GameState => {
  console.log('Applying damage:', damage, 'to target:', target, 'at index:', targetInfo.targetDigimonIndex);
  let remainingDamage = damage;
  let updatedShield = target.shield;
  
  if (updatedShield > 0) {
    if (updatedShield >= remainingDamage) {
      updatedShield -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= updatedShield;
      updatedShield = 0;
    }
  }
  
  const updatedHp = Math.max(0, target.hp - remainingDamage);
  console.log('Updated HP:', updatedHp, 'Remaining damage:', remainingDamage, 'Updated Shield:', updatedShield);

  let updatedState = { ...gameState };

  const isEnemyTarget = ['enemy', 'all_enemies', 'random_enemy'].includes(targetInfo.targetType);

  if (isEnemyTarget) {
    updatedState.enemy.digimon = updatedState.enemy.digimon.map((d, index) => 
      index === targetInfo.targetDigimonIndex ? { ...d, hp: updatedHp, shield: updatedShield } : d
    );
  } else {
    updatedState.player.digimon = updatedState.player.digimon.map((d, index) => {
      if (index === targetInfo.targetDigimonIndex) {
        console.log(`Updating player Digimon at index ${index}:`, { ...d, hp: updatedHp, shield: updatedShield });
        return { ...d, hp: updatedHp, shield: updatedShield };
      }
      return d;
    });

    // Check if the player's Digimon has died
    if (updatedHp <= 0) {
      console.log(`Player Digimon at index ${targetInfo.targetDigimonIndex} has died. Adding DIGIMON_DEATH action to queue.`);
      updatedState.actionQueue.push({
        type: 'DIGIMON_DEATH',
        digimonIndex: targetInfo.targetDigimonIndex
      });
    }
  }

  console.log('Updated player Digimon:', updatedState.player.digimon);

  updatedState.actionQueue.push({ 
    type: 'APPLY_DAMAGE', 
    target: targetInfo, 
    damage, 
    newHp: updatedHp,
    newShield: updatedShield
  });

  return updatedState;
};

export const checkBattleEnd = (gameState: GameState): 'ongoing' | 'win' | 'lose' => {
  if (getAliveDigimon(gameState.player.digimon).length === 0) {
    return 'lose';
  } else if (getAliveDigimon(gameState.enemy.digimon).length === 0) {
    return 'win';
  }
  return 'ongoing';
};
export const calculateDamageWithCrit = (attacker: Digimon, baseDamage: number): number => {
  const isCritical = Math.random() < attacker.critChance;
  const critMultiplier = isCritical ? 1.5 : 1; 
  
  return Math.round(baseDamage * critMultiplier);
};

export const discardCard = (gameState: GameState, cardIndex: number): GameState => {
  const updatedState = { ...gameState };
  if (cardIndex >= 0 && cardIndex < updatedState.player.hand.length) {
    const discardedCard = updatedState.player.hand.splice(cardIndex, 1)[0];
    updatedState.player.discardPile.push(discardedCard);
    updatedState.cardsDiscardedThisTurn++;
    updatedState.cardsDiscardedThisBattle++;
    updatedState.actionQueue.push({ type: 'DISCARD_CARD', card: discardedCard });
  }
  return updatedState;
};

// Add more battle-related functions as needed