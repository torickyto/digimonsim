export const addExperience = (digimon, expGained) => {
    digimon.exp += expGained;
    if (digimon.exp >= 100) {
      levelUp(digimon);
    }
    return digimon;
  };
  
  export const levelUp = (digimon) => {
    digimon.level += 1;
    digimon.exp -= 100;
    digimon.maxHp += 5;
    digimon.hp = digimon.maxHp;
    return digimon;
  };
  
  export const addBlock = (digimon, amount) => {
    digimon.block += amount;
    return digimon;
  };
  
  export const takeDamage = (digimon, amount) => {
    if (digimon.block > 0) {
      if (amount > digimon.block) {
        amount -= digimon.block;
        digimon.block = 0;
      } else {
        digimon.block -= amount;
        amount = 0;
      }
    }
    digimon.hp = Math.max(0, digimon.hp - amount);
    return digimon;
  };