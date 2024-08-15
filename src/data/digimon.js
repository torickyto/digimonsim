const digimonTemplates = {
    Agumon: {
      name: 'Agumon',
      type: 'DATA',
      baseHp: 50,
      specialAbility: {
        name: 'Pepper Breath',
        cost: 2,
        effect: (player, enemy) => { enemy.takeDamage(10); },
        description: 'Deal 10 damage to the enemy.'
      }
    },
    Gabumon: {
      name: 'Gabumon',
      type: 'VACCINE',
      baseHp: 45,
      specialAbility: {
        name: 'Blue Blaster',
        cost: 2,
        effect: (player, enemy) => { 
          enemy.takeDamage(8); 
          player.addBlock(3);
        },
        description: 'Deal 8 damage to the enemy and gain 3 block.'
      }
    },
    Impmon: {
      name: 'Impmon',
      type: 'VIRUS',
      baseHp: 40,
      specialAbility: {
        name: 'Bada Boom',
        cost: 1,
        effect: (player, enemy) => { 
          enemy.takeDamage(6); 
          player.draw(1);
        },
        description: 'Deal 6 damage to the enemy and draw a card.'
      }
    }
  };
  
  export const createUniqueDigimon = (templateName, level = 1) => {
    const template = digimonTemplates[templateName];
    if (!template) throw new Error(`No template found for ${templateName}`);
  
    return {
      id: Date.now(), // Unique ID based on timestamp
      ...template,
      level,
      hp: template.baseHp + (level - 1) * 5,
      maxHp: template.baseHp + (level - 1) * 5,
      block: 0,
      exp: 0
    };
  };
  
  export const getAllDigimonTemplates = () => Object.keys(digimonTemplates);
  
  export const getDigimonTemplate = (name) => digimonTemplates[name];
  
  export const getAllDigimon = () => Object.values(digimonTemplates).map(template => createUniqueDigimon(template.name));
  
  export const getDigimonById = (id) => {
    const allDigimon = getAllDigimon();
    return allDigimon.find(digimon => digimon.id === id);
  };