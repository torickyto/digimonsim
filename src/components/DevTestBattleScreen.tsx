import React, { useState } from 'react';
import { Digimon, Card } from '../shared/types';
import { createDigimon } from '../shared/digimonManager';
import { DigimonTemplates } from '../data/DigimonTemplate';
import { CardCollection } from '../shared/cardCollection';
import BattleScreen from './BattleScreen';
import './DevTestBattleScreen.css';

interface DevTestBattleScreenProps {
    onExit: () => void;
  }

// Pre-made teams
const createCustomTeam = (digimonNames: string[], cardSets: Card[][]): Digimon[] => {
    return digimonNames.map((name, index) => {
      const digimon = createDigimon(DigimonTemplates[name as keyof typeof DigimonTemplates]);
      digimon.deck = cardSets[index];
      return digimon;
    });
  };
  
  // Pre-made player teams
  const preMadeTeams: { name: string; digimon: Digimon[] }[] = [
    {
      name: "OPIUM",
      digimon: createCustomTeam(
        ['beelzemon', 'devimon', 'wizardmon'],
        [
          [CardCollection.CORONA_DESTROYER, CardCollection.BEREJENA, CardCollection.HEART_CRASH],
          [CardCollection.DEADLY_NAIL, CardCollection.HELL_CONTRACT, CardCollection.TOUCH_OF_EVIL],
          [CardCollection.THUNDER_BOMB, CardCollection.MAGICAL_GAME, CardCollection.VISIONS_OF_TERROR]
        ]
      )
    },

    {
        name: "OG",
        digimon: createCustomTeam(
          ['patamon', 'tentomon', 'agumon'],
          [
            [CardCollection.BUBBLE, CardCollection.BOOM_BUBBLE, CardCollection.GLIDE],
            //[CardCollection.SUPER_SHOCKER, CardCollection.DYNAMO_ROCKET, CardCollection.ROLLING_GUARD],
            //[CardCollection.PEPPER_BREATH, CardCollection.BABY_BURNER, CardCollection.SPITFIRE]
            [CardCollection.SUPER_SHOCKER],
            [CardCollection.PEPPER_BREATH]
          ]
        )
      },
    // Add more pre-made teams here
  ];


  const battleScenarios = [
    {
      name: "Apocalypse",
      enemies: [createDigimon(DigimonTemplates['lucemon'])],
      background: require('../assets/backgrounds/thrillerruins.png')
    },
    {
        name: "Goblimon Horde",
        enemies: [
          createDigimon(DigimonTemplates['goblimon']),
          createDigimon(DigimonTemplates['goblimon']),
          createDigimon(DigimonTemplates['goblimon'])
        ],
        background: require('../assets/backgrounds/labelforest.png')
      },
    {
      name: "Hell",
      enemies: [
        createDigimon(DigimonTemplates['devimon']),
        createDigimon(DigimonTemplates['devimon'])
      ],
      background: require('../assets/backgrounds/shadowhell.png')
    },
    // Add more battle scenarios here
  ];

  const DevTestBattleScreen: React.FC<DevTestBattleScreenProps> = ({ onExit }) => {
    const [selectedTeam, setSelectedTeam] = useState<Digimon[]>(preMadeTeams[0].digimon);
    const [selectedScenario, setSelectedScenario] = useState(battleScenarios[0]);
    const [isBattleStarted, setIsBattleStarted] = useState(false);
  
    const handleTeamSelect = (team: Digimon[]) => {
      setSelectedTeam(team);
    };
  
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
          playerTeam={selectedTeam}
          enemyTeam={selectedScenario.enemies}
          onBattleEnd={handleBattleEnd}
          backgroundImage={selectedScenario.background}
        />
      );
    }
  
    return (
      <div className="dev-test-battle-screen">
        <h1>DEV TEST BATTLE</h1>
        <h2>Select a player team:</h2>
        {preMadeTeams.map((team, index) => (
          <button className='devbutton' key={index} onClick={() => handleTeamSelect(team.digimon)}>
            {team.name}
          </button>
        ))}
        <h2>Selected Team:</h2>
        <ul>
          {selectedTeam.map((digimon, index) => (
            <li key={index}>{digimon.displayName}</li>
          ))}
        </ul>
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