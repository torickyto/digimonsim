import { v4 as uuidv4 } from 'uuid';
import { Card, CardEffect, CardEffectType, DigimonType, Digimon, GameState, TargetType, DigimonState } from './types';
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
  WARP_DIGIVOLVE: createCard(
    'WARP_DIGIVOLVE',
    'Warp Digivolve',
    'special',
    8,
    'FREE',
    '',
    'self',
    [{
      description: "Digivolve to a Mega for one battle",
      //can be used once per battle

    }]
  ),

  DIGIVOLVE: createCard(
    'DIGIVOLVE',
    'Digivolve',
    'special',
    5,
    'FREE',
    '',
    'self',
    [{
      description: "Digivolve for one battle",
      //can be used once per battle

    }]
  ),

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

  // In Training

  POISON_BUBBLE: createCard(
    'POISON_BUBBLE',
    'Poison Bubble',
    'attack',
    0,
    'FREE',
    'Deal {damage} damage to an enemy. 25% chance to apply 1 stack of corruption.',
    'enemy',
    [{
      description: "Fires poisonous bubbles.",
      damage: {
        formula: 'LIGHT',
        target: 'enemy'
      },
      applyStatus: {
        type: 'corruption',
        duration: -1,
        value: 1,
        chance: 0.25,
        isResistable: true
      }
    }]
  ),

  BITE: createCard(
    'BITE',
    'Bite',
    'attack',
    0,
    'FREE',
    'Deal {damage} damage to an enemy.',
    'enemy',
    [{
      description: "Bites the enemy with its sharp teeth.",
      damage: {
        formula: 'LIGHT2',
        target: 'enemy'
      }
    }]
  ),

  DOUBLE_BUBBLE: createCard(
    'DOUBLE_BUBBLE',
    'Double Bubble',
    'attack',
    0,
    'FREE',
    'Deal {damage} damage to an enemy twice.',
    'enemy',
    [{
      description: "Fires two bubbles in quick succession.",
      damage: {
        formula: 'LIGHT',
        target: 'enemy'
      },
      repeat: 2
    }]
  ),

  PEPPER_BLAST: createCard(
    'PEPPER_BLAST',
    'Pepper Blast',
    'attack',
    1,
    'FREE',
    'Deal {damage} damage to an enemy. If you have 3 or more RAM, deal {damage} damage again.',
    'enemy',
    [{
      description: "Deal light damage, potentially twice.",
      damage: {
        formula: 'LIGHT',
        target: 'enemy'
      },
      conditional: {
        condition: (state) => state.player.ram >= 3,
        effect: {
          description: "Deal light damage, potentially twice.",
          damage: {
            formula: 'LIGHT',
            target: 'enemy'
          }
        }
      }
    }]
  ),

  // Guilmon
  PYRO_SHOT: createCard(
    'PYRO_SHOT',
    'Pyro Shot',
    'attack',
    2,
    'VIRUS',
    '',
    'enemy',
    [{
      description: "",
      damage: {
        formula: 'STRONG2',
        target: 'random_enemy'
      }
    }]
  ),

  ROCK_BREAKER: createCard(
    'ROCK_BREAKER',
    'Rock Breaker',
    'attack',
    1,
    'VIRUS',
    'Deal {damage} damage to an enemy. Deals double damage to shields.',
    'enemy',
    [{
      description: "Deals basic damage.",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      },
      conditional: {
        condition: (state, targetInfo) => state.enemy.digimon[targetInfo.targetDigimonIndex].shield > 0,
        effect: {
          description: "Deals more damage to shields",
          damage: {
            formula: 'STRONG',
            target: 'enemy'
          }
        }
      }
    }]
  ),

  //Veemon
  VEE_HEADBUTT: createCard(
    'VEE_HEADBUTT',
    'Vee Headbutt',
    'attack',
    0,
    'VACCINE',
    '',
    'enemy',
    [{
      description: "",
      damage: {
        formula: 'LIGHT2',
        target: 'enemy'
      },
      gainRam: 1
    }]
  ),

  VICTORY_RUSH: createCard(
    'VICTORY_RUSH',
    'Victory Rush',
    'attack',
    4,
    'VACCINE',
    '',
    'enemy',
    [{
      description: "Deal Heavy damage",
      damage: {
        formula: 'HEAVY',
        target: 'enemy'
      },
    }]
  ),

  // Terriermon

  TERRIER_TORNADO: createCard(
    'TERRIER_TORNADO',
    'Terrier Tornado',
    'attack',
    3,
    'DATA',
    'Deal {damage} damage to all enemies. Can only be used once per battle.',
    'all_enemies',
    [{
      description: "Deal damage to all enemies.",
      damage: {
        formula: 'STRONG',
        target: 'all_enemies'
      },
      once: true
    }]
  ),

  BUNNY_BLAST: createCard(
    'BUNNY_BLAST',
    'Bunny Blast',
    'attack',
    1,
    'DATA',
    'Deal {damage} damage to an enemy and lower their attack by 20% for 1 turn.',
    'enemy',
    [{
      description: "Deal damage and lower enemy attack.",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      },
      modifyStatMultiplier: {
        stat: 'attack',
        multiplier: 0.8,
        duration: 1
      }
    }]
  ),

  TERRIER_BALLOON: createCard(
    'TERRIER_BALLOON',
    'Terrier Balloon',
    'special',
    1,
    'DATA',
    'Draw a card and gain {shield} shield.',
    'self',
    [{
      description: "Draw a card.",
      drawCards: 1
    },
    {
      description: "Gain shield.",
      shield: {
        formula: 'BASIC',
        target: 'self'
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
      description: "",
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
    'Draw a card. If it\'s not an attack card, discard it.',
    'none',
    [{
      description: "Draw a card and potentially discard it.",
      drawCards: 1,
      conditional: {
        condition: (state) => {
          const drawnCard = state.player.hand[state.player.hand.length - 1];
          return drawnCard.type !== 'attack';
        },
        effect: {
          description: "Discard the drawn card if it's not an attack card.",
          customEffect: (state) => {
            const drawnCard = state.player.hand.pop();
            if (drawnCard) {
              state.player.discardPile.push(drawnCard);
              state.cardsDiscardedThisTurn++;
              state.cardsDiscardedThisBattle++;
            }
            return state;
          }
        }
      },
      recompile: true
    }]
  ),

  // Kunemon
  ELECTRIC_THREAD: createCard(
    'ELECTRIC_THREAD',
    'Electric Thread',
    'attack',
    1,
    'VIRUS',
    'Deal {damage} damage to an enemy. 30% chance to apply Bugged for 1 turn.',
    'enemy',
    [{
      description: "Shoots an electrified thread at the enemy.",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      },
      applyStatus: {
        type: 'bugged',
        duration: 1,
        value: 1,
        chance: 0.3
      }
    }]
  ),

  POISON_RIDE: createCard(
    'POISON_RIDE',
    'Poison Ride',
    'attack',
    2,
    'VIRUS',
    'Deal {damage} damage to an enemy and apply 1 stack of corruption.',
    'enemy',
    [{
      description: "Rides on the enemy while secreting poison.",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      },
      applyStatus: {
        type: 'corruption',
        duration: -1,
        value: 1,
        isResistable: true
      }
    }]
  ),

  // Mushmon
  POISON_SMASH: createCard(
    'POISON_SMASH',
    'Poison Smash',
    'attack',
    2,
    'VIRUS',
    'Deal {damage} damage to an enemy. If the enemy has a status effect, deal {bonusDamage} instead.',
    'enemy',
    [{
      description: "Strikes the enemy with a poisonous blow.",
      damage: {
        formula: 'BASIC2',
        target: 'enemy'
      },
      conditional: {
        condition: (state, targetInfo) => state.enemy.digimon[targetInfo.targetDigimonIndex].statusEffects.length > 0,
        effect: {
          description: "Strikes the enemy with a poisonous blow.",
          damage: {
            formula: 'STRONG',
            target: 'enemy'
          }
        }
      }
    }]
  ),

  LAUGHING_SPORES: createCard(
    'LAUGHING_SPORES',
    'Laughing Spores',
    'special',
    3,
    'VIRUS',
    'Apply Bugged to an enemy for 1 turn. Gain 1 RAM.',
    'enemy',
    [{
      description: "Releases spores that cause uncontrollable laughter.",
      applyStatus: {
        type: 'bugged',
        duration: 1,
        value: 1
      },
      gainRam: 1
    }]
  ),

  // Keramon
  BUG_BLASTER: createCard(
    'BUG_BLASTER',
    'Bug Blaster',
    'attack',
    1,
    'VIRUS',
    '',
    'enemy',
    [{
      description: "",
      damage: {
        formula: 'LIGHT',
        target: 'enemy'
      },
      applyStatus: {
        type: 'bugged',
        duration: 1,
        value: 1,
        chance: 0.5
      }
    }]
  ),

  CRAZY_SMOKE: createCard(
    'CRAZY_SMOKE',
    'Crazy Smoke',
    'attack',
    2,
    'VIRUS',
    '',
    'all_enemies',
    [{
      description: "",
      applyStatus: {
        type: 'corruption',
        duration: -1, // Corruption typically doesn't have a duration, it's removed by other means
        value: 1, // This represents 1 stack of corruption
        isResistable: true // Can be resisted based on the target's corruption resistance
      }
    }]
  ),

  // Monodramon
  CRACKING_BITE: createCard(
    'CRACKING_BITE',
    'Cracking Bite',
    'attack',
    2,
    'VACCINE',
    'Deal {damage} damage to an enemy and lower their attack by 20% for 2 turns.',
    'enemy',
    [{
      description: "Deal damage and lower enemy attack",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      },
      modifyStatMultiplier: {
        stat: 'attack',
        multiplier: 0.8,
        duration: 2
      }
    }]
  ),

  SHADOW_WING: createCard(
    'SHADOW_WING',
    'Shadow Wing',
    'attack',
    2,
    'VACCINE',
    'Deal {damage} damage to an enemy and increase your attack by 20% for 1 turn.',
    'enemy',
    [{
      description: "Deal damage and increase own attack",
      damage: {
        formula: 'BASIC2',
        target: 'enemy'
      },
      modifyStatMultiplier: {
        stat: 'attack',
        multiplier: 1.2,
        duration: 1
      }
    }]
  ),

  // Kamemon

  ARMORED_ARROW: createCard(
    'ARMORED_ARROW',
    'Armored Arrow',
    'attack',
    2,
    'DATA',
    'Deal damage equal to your current shield to an enemy.',
    'enemy',
    [{
      description: "Deal damage based on current shield.",
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
            customValue: value
          }
        })
      }
    }]
  ),

  TORTO_TACKLE: createCard(
    'TORTO_TACKLE',
    'Torto-Tackle',
    'attack',
    2,
    'DATA',
    'Deal {damage} damage to an enemy and gain {shield} shield.',
    'enemy',
    [{
      description: "Deal damage to an enemy.",
      damage: {
        formula: 'BASIC',
        target: 'enemy'
      }
    },
    {
      description: "Gain shield.",
      shield: {
        formula: 'BASIC',
        target: 'self'
      }
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
  'Deal {damage} damage to an enemy. 50% chance to apply Bugged for 1 turn.',
  'enemy',
  [{
    description: "Deal {damage} damage to an enemy.",
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    applyStatus: {
      type: 'bugged',
      duration: 1,
      value: 1,
      chance: 0.5
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
// vilemon

NIGHTMARE_SHOCK: createCard(
  'NIGHTMARE_SHOCK',
  'Nightmare Shock',
  'attack',
  2,
  'VIRUS',
  'Deal {damage} damage to an enemy. If the enemy is affected by a status effect, gain 2 RAM.',
  'enemy',
  [{
    description: "Releases a wave of dark energy.",
    damage: {
      formula: 'BASIC2',
      target: 'enemy'
    },
    conditional: {
      condition: (state, targetInfo) => state.enemy.digimon[targetInfo.targetDigimonIndex].statusEffects.length > 0,
      effect: {
        description: "Releases a wave of dark energy.",
        gainRam: 2
      }
    }
  }]
),

DEMONS_CURSE: createCard(
  'DEMONS_CURSE',
  'Demon\'s Curse',
  'special',
  3,
  'VIRUS',
  'Apply 2 stacks of corruption to an enemy. Draw a card.',
  'enemy',
  [{
    description: "Casts a powerful curse on the enemy.",
    applyStatus: {
      type: 'corruption',
      duration: -1,
      value: 2,
      isResistable: true
    },
    drawCards: 1
  }]
),

// chrysalimon

DATA_CRUSHER: createCard(
  'DATA_CRUSHER',
  'Data Crusher',
  'attack',
  2,
  'VIRUS',
  'Deal {damage} damage to an enemy. Discard a random card from your hand, then draw a card.',
  'enemy',
  [{
    description: "Crushes and absorbs enemy data.",
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    },
    discardCards: 1,
    drawCards: 1
  }]
),

NETWORK_FLAPPING: createCard(
  'NETWORK_FLAPPING',
  'Network Flapping',
  'special',
  3,
  'VIRUS',
  'Apply Bugged to an enemy for 1 turn. If you have 4 or more cards in hand, apply it for 2 turns instead.',
  'enemy',
  [{
    description: "Disrupts the enemy's data with rapid movements.",
    applyStatus: {
      type: 'bugged',
      duration: 1,
      value: 1
    },
    conditional: {
      condition: (state) => state.player.hand.length >= 4,
      effect: {
        description: "Disrupts the enemy's data with rapid movements.",
        applyStatus: {
          type: 'bugged',
          duration: 2,
          value: 1
        }
      }
    }
  }]
),

// garurumon

HOWLING_BLASTER: createCard(
  'HOWLING_BLASTER',
  'Howling Blaster',
  'attack',
  3,
  'DATA',
  'Deal {damage} damage to an enemy. If your shield is greater than 0, deal {bonusDamage} instead.',
  'enemy',
  [{
    description: "Fires a blast of blue energy from its mouth.",
    damage: {
      formula: 'STRONG2',
      target: 'enemy'
    },
    conditional: {
      condition: (state, targetInfo) => state.player.digimon[targetInfo.sourceDigimonIndex].shield > 0,
      effect: {
        description: "Fires a blast of blue energy from its mouth.",
        damage: {
          formula: 'HEAVY',
          target: 'enemy'
        }
      }
    }
  }]
),

FREEZE_FANG: createCard(
  'FREEZE_FANG',
  'Freeze Fang',
  'attack',
  2,
  'DATA',
  'Deal {damage} damage to an enemy and gain {shield} shield. 30% chance to apply Bugged for 1 turn.',
  'enemy',
  [{
    description: "Bites the enemy with freezing fangs.",
    damage: {
      formula: 'BASIC2',
      target: 'enemy'
    },
    shield: {
      formula: 'BASIC',
      target: 'self'
    },
    applyStatus: {
      type: 'bugged',
      duration: 1,
      value: 1,
      chance: 0.3
    }
  }]
),

SUBZERO_ICE_FANG: createCard(
  'SUBZERO_ICE_FANG',
  'Subzero Ice Fang',
  'attack',
  4,
  'DATA',
  'Deal {damage} damage to all enemies. Gain {shield} shield.',
  'all_enemies',
  [{
    description: "Unleashes a widespread freezing attack.",
    damage: {
      formula: 'BASIC',
      target: 'all_enemies'
    },
    shield: {
      formula: 'BASIC2',
      target: 'self'
    }
  }]
),

// angemon

HAND_OF_FATE: createCard(
  'HAND_OF_FATE',
  'Hand of Fate',
  'attack',
  3,
  'VACCINE',
  'Deal {damage} damage to an enemy. Heal yourself for half the damage dealt.',
  'enemy',
  [{
    description: "Fires a beam of sacred energy from its fist.",
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    },
    heal: {
      formula: 'BASIC',
      target: 'self'
    }
  }]
),

ANGEL_ROD: createCard(
  'ANGEL_ROD',
  'Angel Rod',
  'attack',
  2,
  'VACCINE',
  'Deal {damage} damage to an enemy. If the enemy has a status effect, remove it and draw a card.',
  'enemy',
  [{
    description: "Strikes the enemy with a holy staff.",
    damage: {
      formula: 'BASIC2',
      target: 'enemy'
    },
    conditional: {
      condition: (state, targetInfo) => state.enemy.digimon[targetInfo.targetDigimonIndex].statusEffects.length > 0,
      effect: {
        description: "Strikes the enemy with a holy staff.",
        customEffect: (state: GameState) => {
          const lastPlayCardAction = state.actionQueue
            .filter(action => action.type === 'PLAY_CARD')
            .pop();
          
          if (lastPlayCardAction && 'targetInfo' in lastPlayCardAction) {
            const targetIndex = lastPlayCardAction.targetInfo.targetDigimonIndex;
            if (targetIndex !== undefined && state.enemy.digimon[targetIndex]) {
              state.enemy.digimon[targetIndex].statusEffects = [];
            }
          }
          return state;
        },
        drawCards: 1
      }
    }
  }]
),

DIVINE_LIGHT: createCard(
  'DIVINE_LIGHT',
  'Divine Light',
  'special',
  3,
  'VACCINE',
  'Remove all status effects from yourself and all allies. Heal {heal} HP to yourself and all allies.',
  'all_allies',
  [{
    description: "Bathes allies in purifying light.",
    customEffect: (state) => {
      state.player.digimon.forEach(digimon => {
        digimon.statusEffects = [];
      });
      return state;
    },
    heal: {
      formula: 'BASIC_HEAL',
      target: 'all_allies'
    }
  }]
),

// kuwagamon

SCISSOR_ARMS: createCard(
  'SCISSOR_ARMS',
  'Scissor Arms',
  'attack',
  3,
  'VIRUS',
  'Deal {damage} damage to an enemy. If the enemy has a shield, deal double damage to it.',
  'enemy',
  [{
    description: "Slashes the enemy with powerful pincers.",
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    },
    conditional: {
      condition: (state, targetInfo) => state.enemy.digimon[targetInfo.targetDigimonIndex].shield > 0,
      effect: {
        description: "Slashes the enemy with powerful pincers.",
        damage: {
          formula: 'HEAVY',
          target: 'enemy'
        }
      }
    }
  }]
),

POWER_GUILLOTINE: createCard(
  'POWER_GUILLOTINE',
  'Power Guillotine',
  'attack',
  4,
  'VIRUS',
  'Deal {damage} damage to an enemy. Discard a card this turn to deal {bonusDamage} additional damage.',
  'enemy',
  [{
    description: "Performs a powerful cutting attack.",
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    },
    discardCards: 1,
    conditional: {
      condition: (state) => state.cardsDiscardedThisTurn > 0,
      effect: {
        description: "Performs a powerful cutting attack.",
        damage: {
          formula: 'STRONG',
          target: 'enemy'
        }
      }
    }
  }]
),

// veggiemon

SWEET_SCENT: createCard(
  'SWEET_SCENT',
  'Sweet Scent',
  'special',
  2,
  'VIRUS',
  'Apply 2 stacks of corruption to an enemy. Draw a card.',
  'enemy',
  [{
    description: "Releases a deceptively sweet aroma.",
    applyStatus: {
      type: 'corruption',
      duration: -1,
      value: 2,
      isResistable: true
    },
    drawCards: 1
  }]
),

THORN_WHIP: createCard(
  'THORN_WHIP',
  'Thorn Whip',
  'attack',
  3,
  'VIRUS',
  'Deal {damage} damage to an enemy. Gain 1 RAM for each status effect on the target.',
  'enemy',
  [{
    description: "Lashes out with a thorny vine.",
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    },
    customEffect: (state: GameState) => {
      const lastPlayCardAction = state.actionQueue
        .filter(action => action.type === 'PLAY_CARD')
        .pop();
      
      if (lastPlayCardAction && 'targetInfo' in lastPlayCardAction) {
        const targetIndex = lastPlayCardAction.targetInfo.targetDigimonIndex;
        if (targetIndex !== undefined && state.enemy.digimon[targetIndex]) {
          const statusEffectCount = state.enemy.digimon[targetIndex].statusEffects.length;
          state.player.ram += statusEffectCount;
        }
      }
      return state;
    }
  }]
),

// greymon

NOVA_BLAST: createCard(
  'NOVA_BLAST',
  'Nova Blast',
  'attack',
  4,
  'VACCINE',
  'Deal {damage} damage to an enemy. If your RAM is 5 or higher, deal {bonusDamage} instead.',
  'enemy',
  [{
    description: "Fires a massive fireball at the enemy.",
    damage: {
      formula: 'HEAVY',
      target: 'enemy'
    },
    conditional: {
      condition: (state) => state.player.ram >= 5,
      effect: {
        description: "Fires a massive fireball at the enemy.",
        damage: {
          formula: 'MEGA',
          target: 'enemy'
        }
      }
    }
  }]
),

GREAT_HORNS_ATTACK: createCard(
  'GREAT_HORNS_ATTACK',
  'Great Horns Attack',
  'attack',
  3,
  'VACCINE',
  'Deal {damage} damage to an enemy. Gain 2 shield.',
  'enemy',
  [{
    description: "Charges the enemy with powerful horns.",
    damage: {
      formula: 'STRONG2',
      target: 'enemy'
    },
    shield: {
      formula: 'BASIC',
      target: 'self'
    }
  }]
),

MEGA_FLAME: createCard(
  'MEGA_FLAME',
  'Mega Flame',
  'attack',
  5,
  'VACCINE',
  'Deal {damage} damage to all enemies. Discard a card.',
  'all_enemies',
  [{
    description: "Unleashes a widespread flame attack.",
    damage: {
      formula: 'STRONG',
      target: 'all_enemies'
    },
    discardCards: 1
  }]
),

// gargomon 

GARGO_PELLETS: createCard(
  'GARGO_PELLETS',
  'Gargo Pellets',
  'attack',
  2,
  'DATA',
  'Deal {damage} damage to an enemy 3 times.',
  'enemy',
  [{
    description: "Rapid-fires energy bullets from arm cannons.",
    damage: {
      formula: 'BASIC',
      target: 'enemy'
    },
    repeat: 3
  }]
),

BUNNY_PUMMEL: createCard(
  'BUNNY_PUMMEL',
  'Bunny Pummel',
  'attack',
  3,
  'DATA',
  'Deal {damage} damage to an enemy. If your RAM is 4 or higher, apply Bugged for 1 turn.',
  'enemy',
  [{
    description: "Strikes the enemy with arm cannons.",
    damage: {
      formula: 'STRONG',
      target: 'enemy'
    },
    conditional: {
      condition: (state) => state.player.ram >= 4,
      effect: {
        description: "Strikes the enemy with arm cannons.",
        applyStatus: {
          type: 'bugged',
          duration: 1,
          value: 1
        }
      }
    }
  }]
),

GATLING_ARM: createCard(
  'GATLING_ARM',
  'Gatling Arm',
  'attack',
  5,
  'DATA',
  'Deal {damage} damage split randomly among all enemies 5 times.',
  'random_enemy',
  [{
    description: "Unleashes a barrage of bullets at all enemies.",
    damage: {
      formula: 'BASIC',
      target: 'random_enemy'
    },
    repeat: 5
  }]
),

// devimon

TOUCH_OF_EVIL: createCard(
  'TOUCH_OF_EVIL',
  'Touch of Evil',
  'attack',
  3,
  'VIRUS', 
  'Deal {damage} damage to an enemy and apply 1 stack of CORRUPTION.',
  'enemy',
  [{
    description: "Deal {damage} damage to an enemy.",
    damage: {
      formula: 'BASIC2',
      target: 'enemy'
    },
    applyStatus: {
      type: 'corruption',
      duration: -1, // Corruption typically doesn't have a duration, it's removed by other means
      value: 1, // This represents 1 stack of corruption
      isResistable: true // Can be resisted based on the target's corruption resistance
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
  'Deal {damage} damage to a random Digimon (excluding the user).',
  'none',
  [{
    description: "Deal heavy damage to a random Digimon, excluding the user.",
    damage: {
      formula: 'HEAVY',
      target: 'none'
    },
    customEffect: (state: GameState) => {
      const sourceDigimonIndex = state.player.digimon.findIndex(d => d.id === state.currentDigimon);
      const allTargets = [
        ...state.player.digimon.filter((_, index) => index !== sourceDigimonIndex),
        ...state.enemy.digimon
      ];
      const availableTargets = allTargets.filter(digimon => digimon.hp > 0);
      
      if (availableTargets.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTargets.length);
        const target = availableTargets[randomIndex];
        
        // Apply damage to the randomly selected target
        const damage = DamageCalculations['HEAVY'](state.player.digimon[sourceDigimonIndex]);
        target.hp = Math.max(0, target.hp - damage);
        
        // Add an action to the queue for animation purposes
        state.actionQueue.push({
          type: 'APPLY_DAMAGE',
          target: {
            targetType: 'none',
            sourceDigimonIndex: sourceDigimonIndex,
            targetDigimonIndex: allTargets.indexOf(target)
          },
          damage: damage,
          newHp: target.hp,
          newShield: target.shield
        });
      }
    }
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