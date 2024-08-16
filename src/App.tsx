import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';
import { Digimon, DigimonEgg } from './shared/types';
import { createDigimon } from './shared/digimonManager';
import './App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'start' | 'home' | 'battle'>('start');
  const [playerTeam, setPlayerTeam] = useState<Digimon[]>([]);
  const [eggs, setEggs] = useState<DigimonEgg[]>([]);
  const [enemyDigimon, setEnemyDigimon] = useState<Digimon | null>(null);

  const handleChooseDigimon = (digimonTemplate: any) => {
    const newDigimon = createDigimon(
      digimonTemplate.name,
      digimonTemplate.type,
      digimonTemplate.baseHp,
      digimonTemplate.specialAbility
    );
    setPlayerTeam([newDigimon]);
    setGameState('home');
  };

  const handleStartBattle = () => {
    // Create a placeholder enemy
    const enemyDigimon = createDigimon(
      'agumon',
      'VACCINE',
      50,
      {
        name: 'Pepper Breath',
        cost: 2,
        effect: () => {},
        description: 'Deals 10 damage to the enemy.'
      }
    );
    setEnemyDigimon(enemyDigimon);
    setGameState('battle');
  };

  const handleBattleEnd = (playerWon: boolean) => {
    if (playerWon) {
      setPlayerTeam(prevTeam => 
        prevTeam.map(digimon => ({
          ...digimon,
          exp: digimon.exp + 50, // gain 50 exp
        }))
      );
    }
    setGameState('home');
  };

  return (
    <div className="App">
      {gameState === 'start' && <StartScreen onChooseDigimon={handleChooseDigimon} />}
      {gameState === 'home' && (
        <HomeScreen
          playerTeam={playerTeam}
          eggs={eggs}
          onStartBattle={handleStartBattle}
        />
      )}
      {gameState === 'battle' && enemyDigimon && (
        <BattleScreen
          playerTeam={playerTeam}
          enemy={enemyDigimon}
          onBattleEnd={handleBattleEnd}
        />
      )}
    </div>
  );
};

export default App;