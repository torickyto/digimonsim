export const cardTypes = {
    ATTACK: 'ATTACK',
    BLOCK: 'BLOCK',
    SKILL: 'SKILL'
  };
  
  export const createBasicAttackCard = (digimon, index) => ({
    id: `${digimon.name}-attack-${index}`,
    name: 'Attack',
    type: cardTypes.ATTACK,
    cost: 1,
    effect: (player, enemy) => { enemy.takeDamage(6); },
    description: 'Deal 6 damage.'
  });
  
  
export const createBasicBlockCard = (digimon, index) => ({
    id: `${digimon.name}-block-${index}`,
    name: 'Block',
    type: cardTypes.BLOCK,
    cost: 1,
    effect: (player, enemy) => { player.addBlock(5); },
    description: 'Gain 5 block.'
  });
  
  export const createSpecialAbilityCard = (digimon) => ({
    id: `${digimon.name}-special`,
    name: digimon.specialAbility.name,
    type: cardTypes.SKILL,
    cost: digimon.specialAbility.cost,
    effect: digimon.specialAbility.effect,
    description: digimon.specialAbility.description
  });
  
  export const createDeck = (digimon) => {
    return [
      ...Array(3).fill().map((_, index) => createBasicAttackCard(digimon, index)),
      ...Array(3).fill().map((_, index) => createBasicBlockCard(digimon, index)),
      createSpecialAbilityCard(digimon)
    ];
  };
  
  export const shuffleDeck = (deck) => {
    return [...deck].sort(() => Math.random() - 0.5);
  };
  
  export const getHandSize = (teamSize) => {
    switch (teamSize) {
      case 1: return 3;
      case 2: return 5;
      case 3: return 7;
      default: return 5;
    }
  };