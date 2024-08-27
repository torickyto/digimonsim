import { v4 as uuidv4 } from 'uuid';
import { Card, CardEffect, CardEffectType, DigimonType, Digimon, TargetType, DigimonState } from './types';
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
  instanceId: uuidv4(),
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
    'FREE',
    '',
    'enemy',
    [{
      description: "",
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
    'FREE',
    '',
    'self',
    [{
      description: "",
      shield: {
        target: 'self',
        formula: 'LIGHT2'
      }
    }]
  ),

  SNACK_TIME: createCard(
    'SNACK_TIME',
    'Snack Time',
    'special',
    0,
    'FREE',
    '',
    'self',
    [{
      description: "",
      heal: {
        target: 'self',
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
    '',
    'enemy',
    [{
      description: "",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      }
    },
    {
      description: "Draw a card",
      drawCards: 1
    }]
  ),

  INFERNAL_FUNNEL: createCard(
    'INFERNAL_FUNNEL',
    'Infernal Funnel',
    'special',
    0,
    'VIRUS',
    'Select a card to discard.',
    'none',
    [{
      description: "Gain 2 RAM",
      discardCards: 1,
      gainRam: 2
    }],
    true
  ),
  
  RIDICULE: createCard(
    'RIDICULE',
    'Ridicule',
    'special',
    1,
    'VIRUS',
    '',
    'none',
    [{
      description: "Draw a card, if the card is not an attack card then discard it.",
      drawCards: 1,
      conditional: {
        condition: (state) => state.player.hand[state.player.hand.length - 1].type !== 'attack',
        effect: {
          description: "Discard it if it\'s not an attack card.",
          discardCards: 1 //fix this to make it discard to drawn card
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
    'VACCINE',
    '',
    'enemy',
    [{
      description: "",
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
    'VACCINE',
    '',
    'random_enemy',
    [{
      description: "",
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
    4,
    'VACCINE',
    '',
    'all_enemies',
    [{
      description: "",
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
    'DATA',
    '',
    'enemy',
    [{
      description: "",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      }
    },
    {
      description: "Gain shield",
      shield: {
        formula: 'WEAK2',
        target: 'self'
      }
    }]
  ),

SKULL_CRACKER: createCard(
  'SKULL_CRACKER',
  'Skull Cracker',
  'attack',
  1,
  'DATA',
  '',
  'enemy',
  [{
    description: "Can only target enemies with a shield.",
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
  'DATA',
  '',
  'all_enemies',
  [{
    description: "",
    damage: {
      formula: 'BASIC',
      target: 'all_enemies'
    }
  },
  {
    description: "Gain {shield} for each enemy hit.",
    shield: {
      formula: 'WEAK',
      target: 'self'
    },
    scaling: {
      factor: 'enemiesHit',
      effect: (value) => ({ 
        shield: { 
          formula: 'WEAK',
          target: 'self'
        } 
      })
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
    description: "Give an ally shield.",
    shield: {
      formula: 'BASIC2',
      target: 'single_ally'
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
    description: "Draw a card.",
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
    description: "Deal damaage.",
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
    description: "Gain shield.",
    shield: {
      formula: 'BASIC2',
      target: 'self'
    }
  }]
),

SUPER_SHOCKER: createCard(
  'SUPER_SHOCKER',
  'Super Shocker',
  'attack',
  3,
  'VACCINE',
  'Deal {damage} damage to an enemy. Can cause bugged.',
  'enemy',
  [{
    description: "Deal damage to an enemy.",
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    }
  },
  {
    description: "Make an enemy bugged for one turn",
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
    description: "Deal damage to an enemy.",
    conditional: {
      condition: (state, targetInfo) => {
        const target = state.enemy.digimon[targetInfo.targetDigimonIndex!];
        return target.statusEffects.some(effect => effect.type === 'bugged');
      },
      effect: {
        description: "Deal extra damage if the enemy is stunned.",
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
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
    shield: {
      formula: 'BASIC',
      target: 'self'
    }
  },
  {
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    burst: true
  },
  {
    description: "PLACEHOLDER",
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    burst: true
  },
  {
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    }
  },
  {
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
    applyStatus: {
      type: 'corruption',
      duration: 3,
      value: 3
    }
  },
  {
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
    discardCards: 1
  },
  {
    description: "PLACEHOLDER",
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
  'Select a card to discard then gain its RAM.',
  'none',
  [{
    description: "PLACEHOLDER",
    discardCards: 1,
    gainRam: 'discardedCardCost'
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
    description: "PLACEHOLDER",
    drawCards: 3
  },
  {
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
    discardCards: 'all'
  },
  {
    description: "PLACEHOLDER",
    drawCards: 3
  }]
),

BLOODTHIRST: createCard(
  'BLOODTHIRST',
  'Bloodthirst',
  'attack',
  1,
  'VIRUS',
  'Deal {damage} damage to an ally and gain 4 RAM.',
  'single_ally',
  [{
    description: "PLACEHOLDER",
    damage: {
      formula: 'BASIC',
      target: 'single_ally'
    }
  },
  {
    description: "PLACEHOLDER",
    gainRam: 4
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
    description: "PLACEHOLDER",
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
  'GAIN 3 STACKS OF CORRUPTION. GAIN 10 RAM. CANNOT OVERLOAD.',
  'self',
  [{
    description: "PLACEHOLDER",
    applyStatus: {
      type: 'corruption',
      duration: 3,
      value: 3
    }
  },
  {
    description: "PLACEHOLDER",
    gainRam: 10
  }]
),

//revolmon
QUICKSHOT: createCard(
  'QUICKSHOT',
  'Quickshot',
  'attack',
  1,
  'VACCINE',
  '',
  'enemy',
  [{
    description: "",
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    recompile: true
  }]
),

RUSSIAN_ROULETTE: createCard(
  'RUSSIAN_ROULETTE',
  'Russian Roulette',
  'attack',
  1,
  'VACCINE',
  '',
  'random_ally',
  [{
    description: "Shoot a random digimon (implement logic for random targeting except self).",
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    },
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
    description: "PLACEHOLDER",
    shield: {
      target: 'single_ally',
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
    description: "PLACEHOLDER",
    shield: {
      target: 'all',
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
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
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
  'Discard up to 6 cards, then draw up to 6 cards. Gain 1 RAM for each card discarded.',
  'none',
  [{
    description: "PLACEHOLDER",
    discardCards: 6,
    drawCards: 6,
    gainRam: 'discardedCardCount' as const
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
    description: "PLACEHOLDER",
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
  'Discard 2 random cards, gain their RAM cost.',
  'none',
  [{
    description: "Can overload RAM.",
    discardCards: 2,
    gainRam: 'discardedCardCost'
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
    description: "PLACEHOLDER",
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    }
  },
  {
    description: "PLACEHOLDER",
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
    description: "PLACEHOLDER",
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
)}


export const getCardById = (id: string): Card | undefined => {
  const baseCard = CardCollection[id];
  return baseCard ? createCard(
    baseCard.id,
    baseCard.name,
    baseCard.type,
    baseCard.cost,
    baseCard.digimonType,
    baseCard.description,
    baseCard.target,
    baseCard.effects,
    baseCard.requiresCardSelection
  ) : undefined;
};


export const getStarterDeck = (digimonName: string): Card[] => {
  const basicDeck = [
    getCardById('PUNCH_BASIC')!,
    getCardById('PUNCH_BASIC')!,
    getCardById('BLOCK_BASIC')!,
    getCardById('BLOCK_BASIC')!,
  ];
  return basicDeck;
};

export const addCardToDigimon = (digimon: Digimon, cardId: string): Digimon => {
  const newCard = getCardById(cardId);
  if (!newCard) return digimon;
  
  return {
    ...digimon,
    deck: [...digimon.deck, newCard]
  };
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