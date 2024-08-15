import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';

function HomeScreen({ digimon, onStartBattle }) {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    setIsAttacking(true);
  };

  return (
    <div className="home-screen">
      <h1>Your Digimon</h1>
      <div className="digimon-display">
        <DigimonSprite 
          name={digimon.name} 
          isAttacking={isAttacking}
          onAttackComplete={() => setIsAttacking(false)}
        />
        <p>{digimon.displayName}</p>
      </div>
      <button onClick={handleAttack}>Attack Animation</button>
      <button onClick={onStartBattle}>Start Battle</button>
    </div>
  );
}

export default HomeScreen;