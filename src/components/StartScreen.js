import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import WeaknessTriangle from './WeaknessTriangle';
import './StartScreen.css';

const STARTER_DIGIMON = [
  { 
    id: 1, name: 'agumon', displayName: 'Agumon', type: 'DATA',
    hp: 50, maxHp: 50, block: 0,
    specialAbility: {
      name: 'Pepper Breath',
      cost: 2,
      effect: (player, enemy) => { enemy.takeDamage(10); },
      description: 'Deal 10 damage to the enemy.'
    }
  },
  { 
    id: 2, name: 'gabumon', displayName: 'Gabumon', type: 'VACCINE',
    hp: 45, maxHp: 45, block: 0,
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
  { 
    id: 3, name: 'impmon', displayName: 'Impmon', type: 'VIRUS',
    hp: 40, maxHp: 40, block: 0,
    specialAbility: {
      name: 'Bada Boom',
      cost: 1,
      effect: (player, enemy) => { 
        enemy.takeDamage(6); 
        player.draw(1);
      },
      description: 'Deal 6 damage to the enemy and draw a card.'
    }
  },
];

const TYPE_COLORS = {
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};

function StartScreen({ onChooseDigimon }) {
  const [selectedDigimon, setSelectedDigimon] = useState(null);

  const openStatsModal = (digimon) => {
    setSelectedDigimon(digimon);
  };

  const closeStatsModal = () => {
    setSelectedDigimon(null);
  };

  return (
    <div className="start-screen">
      <h1>Choose Your Partner</h1>
      <div className="digimon-selection">
        {STARTER_DIGIMON.map((digimon) => (
          <div 
            key={digimon.id} 
            className="digimon-option"
            style={{ backgroundColor: TYPE_COLORS[digimon.type] }}
          >
            <div className="spotlight">
              <DigimonSprite name={digimon.name} />
            </div>
            <div className="info-box">
              <h2>{digimon.displayName}</h2>
              <p>{digimon.type}</p>
            </div>
            <div className="button-container">
              <button className="view-stats-button" onClick={() => openStatsModal(digimon)}>View Stats</button>
              <button className="select-digimon-button" onClick={() => onChooseDigimon(digimon)}>Select</button>
            </div>
          </div>
        ))}
      </div>

      <WeaknessTriangle />

      {selectedDigimon && (
        <div className="stats-modal">
          <div className="stats-content">
            <DigimonStatScreen digimon={selectedDigimon} isObtained={false} />
            <button className="view-stats-button" onClick={closeStatsModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartScreen;