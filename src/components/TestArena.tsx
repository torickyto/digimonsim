import React, { useState } from 'react';
import { Digimon } from '../shared/types';
import { createDigimon } from '../shared/digimonManager';
import BattleScreen from './BattleScreen';
import { CardCollection } from '../shared/cardCollection';

//ARENA TEST TEAMS
const preAssembledTeams: Digimon[][] = [
  [
    {
      ...createDigimon('impmon', 'VIRUS', 40, CardCollection.BADA_BOOM),
      deck: [
        CardCollection.BADA_BOOM,
        CardCollection.INFERNAL_FUNNEL,
        CardCollection.RIDICULE,
      ]
    },
    {
      ...createDigimon('beelzemon', 'VIRUS', 80, CardCollection.CORONA_DESTROYER),
      deck: [
        CardCollection.CORONA_DESTROYER,
        CardCollection.HEART_CRASH,
        CardCollection.BEREJENA,
      ]
    },
    {
      ...createDigimon('wizardmon', 'DATA', 60, CardCollection.THUNDER_BOMB),
      deck: [
        CardCollection.THUNDER_BOMB,
        CardCollection.MAGICAL_GAME,
        CardCollection.VISIONS_OF_TERROR,
      ]
    }
  ],
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
    // post-battle logic here
  };

  //PLACEHOLDER TEST ENEMY
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