import React, { useState, useEffect } from 'react';

const AREAS = {
  forest: ['Kuwagamon', 'Mushroomon', 'Woodmon'],
  desert: ['Meramon', 'Cactusmon', 'Tyranomon'],
  ocean: ['Seadramon', 'Shellmon', 'Octomon'],
};

function BattleScreen({ playerDigimon, onBattleEnd }) {
  const [enemyDigimon, setEnemyDigimon] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleEnded, setBattleEnded] = useState(false);

  useEffect(() => {
    startBattle();
  }, []);

  const startBattle = () => {
    const area = 'forest'; // This could be passed as a prop or chosen randomly
    const randomEnemy = AREAS[area][Math.floor(Math.random() * AREAS[area].length)];
    setEnemyDigimon({
      name: randomEnemy,
      hp: 100,
      attack: Math.floor(Math.random() * 20) + 10,
      defense: Math.floor(Math.random() * 10) + 5,
    });
    setBattleLog([`A wild ${randomEnemy} appeared!`]);
  };

  const attack = (attacker, defender, isPlayer) => {
    const damage = Math.max(0, attacker.attack - defender.defense);
    defender.hp = Math.max(0, defender.hp - damage);
    const logMessage = `${attacker.name} attacks ${defender.name} for ${damage} damage!`;
    setBattleLog(prev => [...prev, logMessage]);

    if (defender.hp === 0) {
      endBattle(isPlayer);
    } else if (isPlayer) {
      // Enemy's turn
      setTimeout(() => attack(enemyDigimon, playerDigimon, false), 1000);
    }
  };

  const endBattle = (playerWon) => {
    const resultMessage = playerWon ? `${playerDigimon.name} wins!` : `${playerDigimon.name} fainted!`;
    setBattleLog(prev => [...prev, resultMessage]);
    setBattleEnded(true);
    // Here you could add experience, level ups, etc.
  };

  const handlePlayerAttack = () => {
    if (!battleEnded) {
      attack(playerDigimon, enemyDigimon, true);
    }
  };

  return (
    <div className="battle-screen">
      <div className="battle-digimon">
        <div className="player-digimon">
          <h3>{playerDigimon.name}</h3>
          <p>HP: {playerDigimon.hp}</p>
        </div>
        <div className="enemy-digimon">
          <h3>{enemyDigimon?.name}</h3>
          <p>HP: {enemyDigimon?.hp}</p>
        </div>
      </div>
      <div className="battle-log">
        {battleLog.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      <button onClick={handlePlayerAttack} disabled={battleEnded}>Attack</button>
      {battleEnded && <button onClick={onBattleEnd}>Return to Home</button>}
    </div>
  );
}

export default BattleScreen;