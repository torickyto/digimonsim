import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import WeaknessTriangle from './WeaknessTriangle';
import { createDigimon } from '../shared/digimonManager';
import { Digimon, DigimonType, CardType, BattleState, TYPE_COLORS } from '../shared/types';
import { CardCollection } from '../shared/cardCollection';
import './StartScreen.css';

const STARTER_DIGIMON: Omit<Digimon, 'id' | 'deck'>[] = [
  { 
    name: 'agumon',
    displayName: 'Agumon',
    type: 'DATA',
    hp: 50,
    maxHp: 50,
    block: 0,
    level: 1,
    exp: 0,
    baseHp: 50,
    startingCard: CardCollection.PEPPER_BREATH
  },
  { 
    name: 'gabumon',
    displayName: 'Gabumon',
    type: 'VACCINE',
    hp: 45,
    maxHp: 45,
    block: 0,
    level: 1,
    exp: 0,
    baseHp: 45,
    startingCard: CardCollection.BLUE_BLASTER
  },
  { 
    name: 'impmon',
    displayName: 'Impmon',
    type: 'VIRUS',
    hp: 40,
    maxHp: 40,
    block: 0,
    level: 1,
    exp: 0,
    baseHp: 40,
    startingCard: CardCollection.BADA_BOOM
  },
];

interface StartScreenProps {
  onChooseDigimon: (digimon: Digimon) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onChooseDigimon }) => {
  const [selectedDigimon, setSelectedDigimon] = useState<Omit<Digimon, 'id' | 'deck'> | null>(null);

  const handleChooseDigimon = (template: Omit<Digimon, 'id' | 'deck'>) => {
    const newDigimon = createDigimon(
      template.name,
      template.type,
      template.baseHp,
      template.startingCard
    );
    onChooseDigimon(newDigimon);
  };

  const openStatsModal = (digimon: Omit<Digimon, 'id' | 'deck'>) => {
    setSelectedDigimon(digimon);
  };

  const closeStatsModal = () => {
    setSelectedDigimon(null);
  };

  return (
    <div className="start-screen">
      <h1>Choose Your Partner</h1>
      <div className="digimon-selection">
      {STARTER_DIGIMON.map((digimon, index) => (
        <div 
          key={index} 
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
            <button className="view-stats-button" onClick={() => setSelectedDigimon(digimon)}>View Stats</button>
            <button className="select-digimon-button" onClick={() => handleChooseDigimon(digimon)}>Select</button>
          </div>
        </div>
      ))}
      </div>

      <WeaknessTriangle />

      {selectedDigimon && (
        <div className="stats-modal">
          <div className="stats-content">
            <DigimonStatScreen digimon={{...selectedDigimon, id: 0, deck: []}} isObtained={false} />
            <button className="view-stats-button" onClick={closeStatsModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartScreen;