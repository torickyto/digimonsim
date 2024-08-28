import React, { useState } from 'react';
import { Digimon } from '../shared/types';
import { createDigimon } from '../shared/digimonManager';
import { DigimonTemplates } from '../data/DigimonTemplate';
import BattleScreen from './BattleScreen';
import './DevTestBattleScreen.css';

interface DevTestBattleScreenProps {
  onExit: () => void;
  playerTeam: Digimon[];
}

const battleScenarios = [
  {
    name: "Label Forest",
    enemies: [
      createDigimon(DigimonTemplates['goblimon']),
      createDigimon(DigimonTemplates['terriermon'])
    ],
    background: require('../assets/backgrounds/labelforest.png')
  },
  {
    name: "Shadow Hell",
    enemies: [
      createDigimon(DigimonTemplates['devimon']),
      createDigimon(DigimonTemplates['skullknightmon'])
    ],
    background: require('../assets/backgrounds/shadowhell.png')
  },
  {
    name: "Pixel Desert",
    enemies: [
      createDigimon(DigimonTemplates['revolmon']),
      createDigimon(DigimonTemplates['superstarmon'])
    ],
    background: require('../assets/backgrounds/pixeldesert.png')
  },
  {
    name: "North Cave",
    enemies: [createDigimon(DigimonTemplates['kimeramon'])],
    background: require('../assets/backgrounds/northcave.png')
  },
  {
    name: "Magnet Mine",
    enemies: [
      createDigimon(DigimonTemplates['vilemon']),
      createDigimon(DigimonTemplates['chrysalimon']),
      createDigimon(DigimonTemplates['vilemon'])
    ],
    background: require('../assets/backgrounds/magnetmine.png')
  },
  {
    name: "Palette Amazon",
    enemies: [
      createDigimon(DigimonTemplates['sangloupmon']),
      createDigimon(DigimonTemplates['matadormon'])
    ],
    background: require('../assets/backgrounds/paletteamazon.png')
  },
  {
    name: "Thriller Ruins",
    enemies: [createDigimon(DigimonTemplates['lucemon'])],
    background: require('../assets/backgrounds/thrillerruins.png')
  }
];

const DevTestBattleScreen: React.FC<DevTestBattleScreenProps> = ({ onExit, playerTeam }) => {
  const [selectedScenario, setSelectedScenario] = useState(battleScenarios[0]);
  const [isBattleStarted, setIsBattleStarted] = useState(false);

  const handleScenarioSelect = (scenario: typeof battleScenarios[0]) => {
    setSelectedScenario(scenario);
  };

  const startBattle = () => {
    setIsBattleStarted(true);
  };

  const handleBattleEnd = () => {
    setIsBattleStarted(false);
  };

  if (isBattleStarted) {
    return (
      <BattleScreen
      playerTeam={playerTeam}
        enemyTeam={selectedScenario.enemies}
        onBattleEnd={handleBattleEnd}
        backgroundImage={selectedScenario.background}
      />
    );
  }

  return (
    <div className="dev-test-battle-screen">
      <h1>DEV TEST BATTLE</h1>
      <h2>Select a battle scenario:</h2>
      {battleScenarios.map((scenario, index) => (
        <button className='devbutton' key={index} onClick={() => handleScenarioSelect(scenario)}>
          {scenario.name}
        </button>
      ))}
      <h3>Selected Scenario: {selectedScenario.name}</h3>
      <button className='devbutton' onClick={startBattle}>Start Battle</button>
      <button className='devbutton' onClick={onExit}>Exit to Home Screen</button>
    </div>
  );
};

export default DevTestBattleScreen;