import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import WeaknessTriangle from './WeaknessTriangle';
import { createDigimon } from '../shared/digimonManager';
import { Digimon, DigimonType, SpecialAbility, TYPE_COLORS } from '../shared/types';
import './StartScreen.css';

const STARTER_DIGIMON: Digimon[] = [
  { 
    id: 1,
    name: 'agumon',
    displayName: 'Agumon',
    type: 'DATA',
    hp: 50,
    maxHp: 50,
    block: 0,
    level: 1,
    exp: 0,
    baseHp: 50,
    specialAbility: {
      name: 'Pepper Breath',
      cost: 2,
      effect: (attacker, defender, battleState) => {
        console.log(`${attacker.name} uses Pepper Breath on ${defender.name}`);
        battleState.damageEnemy(10);
      },
      description: 'Deal 10 damage to the enemy.'
    },
    deck: []
  },
  { 
    id: 2,
    name: 'gabumon',
    displayName: 'Gabumon',
    type: 'VACCINE',
    hp: 45,
    maxHp: 45,
    block: 0,
    level: 1,
    exp: 0,
    baseHp: 45,
    specialAbility: {
      name: 'Blue Blaster',
      cost: 2,
      effect: (attacker, defender, battleState) => {
        console.log(`${attacker.name} uses Blue Blaster on ${defender.name}`);
      },
      description: 'Deal 8 damage to the enemy and gain 3 block.'
    },
    deck: []  
  },
  { 
    id: 3,
    name: 'impmon',
    displayName: 'Impmon',
    type: 'VIRUS',
    hp: 40,
    maxHp: 40,
    block: 0,
    level: 1,
    exp: 0,
    baseHp: 40,
    specialAbility: {
      name: 'Bada Boom',
      cost: 1,
      effect: (attacker, defender, battleState) => {
        console.log(`${attacker.name} uses Bada Boom on ${defender.name}`);
      },
      description: 'Deal 6 damage to the enemy and draw a card.'
    },
    deck: [] 
  },
];

interface StartScreenProps {
  onChooseDigimon: (digimon: Digimon) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onChooseDigimon }) => {
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);

  const handleChooseDigimon = (template: Digimon) => {
    const newDigimon = createDigimon(
      template.name,
      template.type,
      template.baseHp,
      template.specialAbility
    );
    onChooseDigimon(newDigimon);
  };

  const openStatsModal = (digimon: Digimon) => {
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
            <DigimonStatScreen digimon={selectedDigimon} isObtained={false} />
            <button className="view-stats-button" onClick={closeStatsModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartScreen;