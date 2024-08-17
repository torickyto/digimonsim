import React, { useState } from 'react';
import { Digimon } from '../shared/types';
import { createDigimon } from '../shared/digimonManager';
import BattleScreen from './BattleScreen';
import { CardCollection } from '../shared/cardCollection';

const preAssembledTeams: Digimon[][] = [
  [
    createDigimon('impmon', 'VIRUS', 40, CardCollection.BADA_BOOM),
    createDigimon('beelzemon', 'VIRUS', 80, CardCollection.CORONA_DESTROYER),
    createDigimon('wizardmon', 'DATA', 60, CardCollection.THUNDER_BOMB)
  ],
  // Add more pre-assembled teams here
];

const TestArena: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<Digimon[] | null>(null);
  const [inBattle, setInBattle] = useState(false);

  const handleTeamSelect = (index: number) => {
    setSelectedTeam(preAssembledTeams[index]);
  };

  const startBattle = () => {
    if (selectedTeam) {
      setInBattle(true);
    }
  };

  const handleBattleEnd = (playerWon: boolean) => {
    setInBattle(false);
    // Handle post-battle logic here
  };

  if (inBattle && selectedTeam) {
    return <BattleScreen 
      playerTeam={selectedTeam} 
      enemy={createDigimon('agumon', 'VACCINE', 100, CardCollection.PEPPER_BREATH)}
      onBattleEnd={handleBattleEnd}
    />;
  }

  return (
    <div className="test-arena">
      <h2>Test Arena</h2>
      <div className="team-selection">
        {preAssembledTeams.map((team, index) => (
          <button key={index} onClick={() => handleTeamSelect(index)}>
            Select Team {index + 1}
          </button>
        ))}
      </div>
      {selectedTeam && (
        <div className="selected-team">
          <h3>Selected Team:</h3>
          <ul>
            {selectedTeam.map((digimon, index) => (
              <li key={index}>{digimon.displayName}</li>
            ))}
          </ul>
          <button onClick={startBattle}>Start Battle</button>
        </div>
      )}
    </div>
  );
};

export default TestArena;