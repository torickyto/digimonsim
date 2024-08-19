import React, { useState } from 'react';
import { Digimon, DigimonTemplate } from '../shared/types';
import { createDigimon } from '../shared/digimonManager';
import { DigimonTemplates } from '../data/DigimonTemplate';
import DigimonSprite from './DigimonSprite';
import WeaknessTriangle from './WeaknessTriangle';
import './StartScreen.css';

const STARTER_DIGIMON: string[] = ['agumon', 'gabumon', 'impmon'];

interface StartScreenProps {
  onStartGame: (party: Digimon[]) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [party, setParty] = useState<Digimon[]>([]);

  const addToParty = (templateName: string) => {
    if (party.length < 3) {
      const template = DigimonTemplates[templateName];
      if (template) {
        const newDigimon = createDigimon(template);
        setParty([...party, newDigimon]);
      }
    }
  };

  const removeFromParty = (digimon: Digimon) => {
    setParty(party.filter(d => d.id !== digimon.id));
  };

  const startGame = () => {
    if (party.length > 0) {
      onStartGame(party);
    } else {
      alert("Please select at least one Digimon for your party.");
    }
  };

  return (
    <div className="start-screen">
      <h1>Choose Your Digimon Party</h1>
      
      <div className="digimon-selection">
        {STARTER_DIGIMON.map((digimonName) => {
          const template = DigimonTemplates[digimonName];
          return (
            <div key={digimonName} className="digimon-option">
              <DigimonSprite name={digimonName} />
              <h3>{template.displayName}</h3>
              <p>Type: {template.type}</p>
              <p>HP: {template.baseHp}</p>
              <p>Starting Card: {template.startingCard.name}</p>
              <button onClick={() => addToParty(digimonName)} disabled={party.length >= 3}>
                Add to Party
              </button>
            </div>
          );
        })}
      </div>

      <h2>Your Party ({party.length}/3)</h2>
      <div className="party-selection">
        {party.map((digimon) => (
          <div key={digimon.id} className="party-member">
            <DigimonSprite name={digimon.name} />
            <h3>{digimon.displayName}</h3>
            <p>Type: {digimon.type}</p>
            <p>HP: {digimon.hp}/{digimon.maxHp}</p>
            <button onClick={() => removeFromParty(digimon)}>Remove</button>
          </div>
        ))}
      </div>

      <button className="start-game-button" onClick={startGame} disabled={party.length === 0}>
        Start Game
      </button>

      <WeaknessTriangle />
    </div>
  );
};

export default StartScreen;