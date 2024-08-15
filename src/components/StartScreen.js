import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import './StartScreen.css';

const STARTER_DIGIMON = [
  { 
    id: 1, name: 'agumon', displayName: 'Agumon', type: 'DATA',
    stats: { level: 5, health: 100, attack: 15, defence: 10, speed: 8 }
  },
  { 
    id: 2, name: 'gabumon', displayName: 'Gabumon', type: 'VACCINE',
    stats: { level: 5, health: 95, attack: 14, defence: 12, speed: 7 }
  },
  { 
    id: 3, name: 'impmon', displayName: 'Impmon', type: 'VIRUS',
    stats: { level: 5, health: 90, attack: 16, defence: 8, speed: 10 }
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
      <h1>Choose Your Digimon Partner</h1>
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

      {selectedDigimon && (
        <div className="stats-modal">
          <div className="stats-content">
            <DigimonStatScreen digimon={selectedDigimon} isObtained={false} />
            <button onClick={closeStatsModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartScreen;