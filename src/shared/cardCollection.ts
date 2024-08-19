import { Card, CardEffect, CardEffectType, DigimonType, TargetType, DigimonState } from './types';
import { DamageCalculations } from './damageCalculations';

const createCard = (
  id: string,
  name: string,
  type: CardEffectType,
  cost: number,
  digimonType: DigimonType,
  description: string,
  target: TargetType,
  effects: CardEffect[],
  requiresCardSelection: boolean = false
): Card => ({
  id,
  name,
  type,
  cost,
  digimonType,
  description,
  target,
  effects,
  requiresCardSelection,
  ownerDigimonIndex: 0 
});

export const CardCollection: Record<string, Card> = {
  PUNCH_BASIC: createCard(
    'PUNCH_BASIC',
    'Punch',
    'attack',
    1,
    'NULL',
    'Deal {damage} damage to the target.',
    'enemy',
    [{
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      }
    }]
  ),

  BLOCK_BASIC: createCard(
    'BLOCK_BASIC',
    'Block',
    'shield',
    1,
    'NULL',
    'Gain {shield} shield.',
    'self',
    [{
      shield: {
        formula: 'BASIC'
      }
    }]
  ),

  SNACK_TIME: createCard(
    'SNACK_TIME',
    'Snack Time',
    'special',
    0,
    'NULL',
    'Heal self for {heal} HP.',
    'self',
    [{
      heal: {
        formula: 'LIGHT_HEAL'
      }
    }]
  ),

  // Impmon 
  BADA_BOOM: createCard(
    'BADA_BOOM',
    'Bada Boom',
    'attack',
    1,
    'VIRUS',
    'Deal {damage} damage and draw 1 card.',
    'enemy',
    [{
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      }
    },
    {
      drawCards: 1
    }]
  ),

  INFERNAL_FUNNEL: createCard(
    'INFERNAL_FUNNEL',
    'Infernal Funnel',
    'special',
    0,
    'VIRUS',
    'Select a card to discard and gain 2 energy.',
    'none',
    [{
      discardCards: 1,
      gainEnergy: 2
    }],
    true
  ),
  
  RIDICULE: createCard(
    'RIDICULE',
    'Ridicule',
    'special',
    1,
    'VIRUS',
    'Draw a card, discard it if it\'s not an attack card.',
    'none',
    [{
      drawCards: 1,
      conditional: {
        condition: (state) => state.player.hand[state.player.hand.length - 1].type !== 'attack',
        effect: {
          discardCards: 1
        }
      },
      recompile: true
    }]
  ),

  // Agumon
  PEPPER_BREATH: createCard(
    'PEPPER_BREATH',
    'Pepper Breath',
    'attack',
    2,
    'DATA',
    'Deal {damage} damage to an enemy.',
    'enemy',
    [{
      damage: {
        formula: 'STRONG',
        target: 'enemy'
      }
    }]
  ),

  SPITFIRE: createCard(
    'SPITFIRE',
    'Spit Fire',
    'attack',
    3,
    'DATA',
    'Deal {damage} damage to a random enemy.',
    'random_enemy',
    [{
      damage: {
        formula: 'HEAVY',
        target: 'random_enemy'
      }
    }]
  ),

  BABY_BURNER: createCard(
    'BABY_BURNER',
    'Baby Burner',
    'attack',
    5,
    'DATA',
    'Deal {damage} damage to all enemies.',
    'all_enemies',
    [{
      damage: {
        formula: 'STRONG2',
        target: 'all_enemies'
      }
    }]
  ),

  //gabumon
  BLUE_BLASTER: createCard(
    'BLUE_BLASTER',
    'Blue Blaster',
    'attack',
    2,
    'VACCINE',
    'Deal {damage} damage to the enemy and gain {shield} shield.',
    'enemy',
    [{
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      }
    },
    {
      shield: {
        formula: 'WEAK2'
      }
    }]
  ),

SKULL_CRACKER: createCard(
  'SKULL_CRACKER',
  'Skull Cracker',
  'attack',
  1,
  'VACCINE',
  'Can only target enemies with shield. Deal {damage} damage.',
  'enemy',
  [{
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    },
    requireEnemyShield: true
  }]
),

BLUE_CYCLONE: createCard(
  'BLUE_CYCLONE',
  'Blue Cyclone',
  'attack',
  4,
  'VACCINE',
  'Deal {damage} damage to all enemies. Each enemy hit gives the user {shield} shield.',
  'all_enemies',
  [{
    damage: {
      formula: 'BASIC',
      target: 'all_enemies'
    }
  },
  {
    shield: {
      formula: 'WEAK'
    },
    scaling: {
      factor: 'enemiesHit',
      effect: (value) => ({ shield: { formula: 'WEAK' } })
    }
  }]
),

BUBBLE: createCard(
  'BUBBLE',
  'Bubble',
  'shield',
  1,
  'VACCINE',
  'Give an ally {shield} shield.',
  'single_ally',
  [{
    shield: {
      formula: 'BASIC2'
    }
  }]
),

GLIDE: createCard(
  'GLIDE',
  'Glide',
  'special',
  1,
  'VACCINE',
  'Draw a card, that card costs 1 less.',
  'none',
  [{
    drawCards: 1,
    modifyCost: {
      target: 'specific',
      amount: -1,
      duration: 1
    }
  }]
),

BOOM_BUBBLE: createCard(
  'BOOM_BUBBLE',
  'Boom Bubble',
  'attack',
  1,
  'VACCINE',
  'Deal {damage} damage to an enemy.',
  'enemy',
  [{
    damage: {
      formula: 'BASIC2',
      target: 'enemy'
    }
  }]
),

ROLLING_GUARD: createCard(
  'ROLLING_GUARD',
  'Rolling Guard',
  'shield',
  1,
  'VACCINE',
  'Gain {shield} shield.',
  'self',
  [{
    shield: {
      formula: 'BASIC2'
    }
  }]
),

SUPER_SHOCKER: createCard(
  'SUPER_SHOCKER',
  'Super Shocker',
  'attack',
  3,
  'VACCINE',
  'Deal {damage} damage to an enemy. Can stun.',
  'enemy',
  [{
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    }
  },
  {
    applyStatus: {
      type: 'bugged',
      duration: 1,
      value: 1
    }
  }]
),

DYNAMO_ROCKET: createCard(
  'DYNAMO_ROCKET',
  'Dynamo Rocket',
  'attack',
  2,
  'VACCINE',
  'Deal {damage} damage to an enemy. If the enemy is stunned, deal {bonusDamage} damage instead.',
  'enemy',
  [{
    damage: {
      formula: 'BASIC2',
      target: 'enemy'
    },
    conditional: {
      condition: (state, targetInfo) => {
        const target = state.enemy.digimon[targetInfo.targetDigimonIndex!];
        return target.statusEffects.some(effect => effect.type === 'bugged');
      },
      effect: {
        damage: {
          formula: 'HEAVY2',
          target: 'enemy'
        }
      }
    }
  }]
),


GOBLIN_STRIKE: createCard(
  'GOBLIN_STRIKE',
  'Goblin Strike',
  'attack',
  2,
  'VIRUS',
  'Deal {damage} damage to an enemy.',
  'enemy',
  [{
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    }
  }]
),

LIVING_SHIELD: createCard(
  'LIVING_SHIELD',
  'Living Shield',
  'shield',
  1,
  'VIRUS',
  'Gain {shield} shield and taunt one target.',
  'self',
  [{
    shield: {
      formula: 'BASIC'
    }
  },
  {
    applyStatus: {
      type: 'taunt',
      duration: 2,
      value: 1
    }
  }]
),

GOBURI_RUSH: createCard(
  'GOBURI_RUSH',
  'Goburi Rush',
  'attack',
  3,
  'VIRUS',
  '[BURST] Deal {damage} damage to an enemy 3 times.',
  'enemy',
  [{
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    burst: true
  },
  {
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    burst: true
  },
  {
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    burst: true
  }]
),

TOUCH_OF_EVIL: createCard(
  'TOUCH_OF_EVIL',
  'Touch of Evil',
  'attack',
  3,
  'VACCINE',
  'Deal {damage} damage and apply CORRUPTION.',
  'enemy',
  [{
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    }
  },
  {
    applyStatus: {
      type: 'corruption',
      duration: 3,
      value: 1
    }
  }]
),

HELL_CONTRACT: createCard(
  'HELL_CONTRACT',
  'Hell Contract',
  'special',
  2,
  'VACCINE',
  'Apply 3 stacks of corruption on an ally or enemy and double their attack for 1 turn.',
  'single_ally',
  [{
    applyStatus: {
      type: 'corruption',
      duration: 3,
      value: 3
    }
  },
  {
    modifyStatMultiplier: {
      stat: 'attack',
      multiplier: 2,
      duration: 1
    }
  }]
),

DEADLY_NAIL: createCard(
  'DEADLY_NAIL',
  'Deadly Nail',
  'special',
  3,
  'VACCINE',
  'Discard a random card and deal {damage} damage to the target.',
  'enemy',
  [{
    discardCards: 1
  },
  {
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    }
  }]
),

MAGICAL_GAME: createCard(
  'MAGICAL_GAME',
  'Magical Game',
  'special',
  1,
  'VACCINE',
  'Select a card to discard then gain its energy.',
  'none',
  [{
    discardCards: 1,
    gainEnergy: 'discardedCardCost'
  }],
  true
),

THUNDER_BOMB: createCard(
  'THUNDER_BOMB',
  'Thunder Bomb',
  'special',
  4,
  'VACCINE',
  'Draw up to 3 cards then deal their combined cost * 10 to all enemies.',
  'all_enemies',
  [{
    drawCards: 3
  },
  {
    damage: {
      formula: 'CUSTOM',
      target: 'all_enemies'
    },
    scaling: {
      factor: 'drawnCardsCost',
      effect: (value) => ({
        damage: {
          formula: 'CUSTOM',
          target: 'all_enemies',
          customValue: value * 10
        }
      })
    }
  }]
),

VISIONS_OF_TERROR: createCard(
  'VISIONS_OF_TERROR',
  'Visions of Terror',
  'special',
  1,
  'VACCINE',
  'Discard your hand, then draw 3 cards.',
  'none',
  [{
    discardCards: 'all'
  },
  {
    drawCards: 3
  }]
),

BLOODTHIRST: createCard(
  'BLOODTHIRST',
  'Bloodthirst',
  'attack',
  1,
  'VIRUS',
  'Deal {damage} damage to an ally and gain 4 energy.',
  'single_ally',
  [{
    damage: {
      formula: 'BASIC',
      target: 'single_ally'
    }
  },
  {
    gainEnergy: 4
  }]
),

RAVAGE: createCard(
  'RAVAGE',
  'Ravage',
  'attack',
  6,
  'VIRUS',
  'Deal {damage} damage to an enemy. HIGH CRIT RATE',
  'enemy',
  [{
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    },
    modifyStatMultiplier: {
      stat: 'critChance',
      multiplier: 2,
      duration: 1
    }
  }]
),

DARK_MIND: createCard(
  'DARK_MIND',
  'Dark Mind',
  'special',
  5,
  'VIRUS',
  'GAIN 3 STACKS OF CORRUPTION. GAIN 10 ENERGY. CANNOT OVERLOAD.',
  'self',
  [{
    applyStatus: {
      type: 'corruption',
      duration: 3,
      value: 3
    }
  },
  {
    gainEnergy: 10
  }]
),

DJ_SHOOTER: createCard(
  'DJ_SHOOTER',
  'DJ Shooter',
  'shield',
  2,
  'DATA',
  'Give an ally {shield} shield.',
  'single_ally',
  [{
    shield: {
      formula: 'STRONG'
    }
  }]
),

BREAK_IT_DOWN: createCard(
  'BREAK_IT_DOWN',
  'Break It Down',
  'shield',
  3,
  'DATA',
  'Give all allies and enemies {shield} shield.',
  'all',
  [{
    shield: {
      formula: 'STRONG'
    }
  }]
),

MEGATON_HYDRO_LASER: createCard(
  'MEGATON_HYDRO_LASER',
  'Megaton Hydro Laser',
  'attack',
  8,
  'DATA',
  'Deal damage equal to user\'s shield * 10 to an enemy.',
  'enemy',
  [{
    damage: {
      formula: 'CUSTOM',
      target: 'enemy'
    },
    scaling: {
      factor: 'userShield',
      effect: (value) => ({
        damage: {
          formula: 'CUSTOM',
          target: 'enemy',
          customValue: value * 10
        }
      })
    }
  }]
),

JUMBO_CRATER: createCard(
  'JUMBO_CRATER',
  'Jumbo Crater',
  'attack',
  4,
  'DATA',
  'Deal damage equal to your current shield * 3 to all enemies.',
  'all_enemies',
  [{
    damage: {
      formula: 'CUSTOM',
      target: 'all_enemies'
    },
    scaling: {
      factor: 'userShield',
      effect: (value) => ({
        damage: {
          formula: 'CUSTOM',
          target: 'all_enemies',
          customValue: value * 3
        }
      })
    }
  }]
),

HEART_CRASH: createCard(
  'HEART_CRASH',
  'Heart Crash',
  'special',
  6,
  'VIRUS',
  'Discard up to 6 cards, then draw up to 6 cards. Gain 1 energy for each card discarded.',
  'none',
  [{
    discardCards: 6,
    drawCards: 6,
    gainEnergy: 'discardedCardCount' as const
  }]
),

CORONA_DESTROYER: createCard(
  'CORONA_DESTROYER',
  'Corona Destroyer',
  'attack',
  6,
  'VIRUS',
  'Deal {damage} damage * number of cards discarded this battle to random enemies.',
  'random_enemy',
  [{
    damage: {
      formula: 'LIGHT',
      target: 'random_enemy'
    },
    scaling: {
      factor: 'cardsDiscardedThisBattle',
      effect: (value) => ({
        damage: {
          formula: 'CUSTOM',
          target: 'random_enemy',
          customValue: value
        }
      })
    }
  }]
),

BEREJENA: createCard(
  'BEREJENA',
  'Berejena',
  'special',
  3,
  'VIRUS',
  'Discard 2 random cards, gain their energy cost. Can overload.',
  'none',
  [{
    discardCards: 2,
    gainEnergy: 'discardedCardCost'
  }]
),

DEATH_CLAW: createCard(
  'DEATH_CLAW',
  'Death Claw',
  'attack',
  5,
  'VIRUS',
  'Deal {damage} damage to an enemy and inflict a non-resistable stack of CORRUPTION.',
  'enemy',
  [{
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    }
  },
  {
    applyStatus: {
      type: 'corruption',
      duration: 3,
      value: 1,
      isResistable: false
    }
  }]
),

HEAT_VIPER: createCard(
  'HEAT_VIPER',
  'Heat Viper',
  'attack',
  10,
  'VIRUS',
  'Deal {damage} damage to random targets 6 times. Apply a stack of CORRUPTION per hit.',
  'random_enemy',
  [{
    damage: {
      formula: 'BASIC',
      target: 'random_enemy'
    },
    applyStatus: {
      type: 'corruption',
      duration: 3,
      value: 1
    },
    repeat: 6
  }]
)
}

export const getCardById = (id: string): Card | undefined => {
  return CardCollection[id];
};

export const getStarterDeck = (digimonName: string): Card[] => {
  const basicDeck = [
    CardCollection.PUNCH_BASIC,
    CardCollection.PUNCH_BASIC,
    CardCollection.BLOCK_BASIC,
    CardCollection.BLOCK_BASIC,
  ];
  return basicDeck;
};

export const updateCardDescription = (card: Card, attacker: DigimonState): Card => {
  let updatedDescription = card.description;

  card.effects.forEach(effect => {
    if (effect.damage && effect.damage.formula) {
      const damage = DamageCalculations[effect.damage.formula](attacker);
      updatedDescription = updatedDescription.replace('{damage}', damage.toString());
    }

    if (effect.shield && effect.shield.formula) {
      const shieldValue = DamageCalculations[effect.shield.formula](attacker);
      updatedDescription = updatedDescription.replace('{shield}', shieldValue.toString());
    }

    if (effect.heal && effect.heal.formula) {
      const healValue = DamageCalculations[effect.heal.formula](attacker);
      updatedDescription = updatedDescription.replace('{heal}', healValue.toString());
    }

    if (effect.conditional && effect.conditional.effect.damage) {
      const bonusDamage = DamageCalculations[effect.conditional.effect.damage.formula](attacker);
      updatedDescription = updatedDescription.replace('{bonusDamage}', bonusDamage.toString());
    }
  });

  return { ...card, description: updatedDescription };
};