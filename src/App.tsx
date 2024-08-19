import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';
import { Digimon, DigimonEgg } from './shared/types';
import { createUniqueDigimon } from './data/digimon';
import './App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'start' | 'home' | 'battle'>('start');
  const [playerTeam, setPlayerTeam] = useState<Digimon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Digimon[]>([]);
  const [eggs, setEggs] = useState<DigimonEgg[]>([]);

  const handleStartGame = (selectedTeam: Digimon[]) => {
    setPlayerTeam(selectedTeam);
    setGameState('home');
  };

  const handleStartBattle = () => {
    // Create a random enemy team (for example purposes, we'll use Agumon)
    const enemyAgumon = createUniqueDigimon('agumon');
    setEnemyTeam([enemyAgumon]);
    setGameState('battle');
  };

  const handleBattleEnd = (result: 'win' | 'lose') => {
    if (result === 'win') {
      // Handle victory (e.g., gain experience, level up)
      setPlayerTeam(prevTeam => 
        prevTeam.map(digimon => ({
          ...digimon,
          exp: digimon.exp + 50, // gain 50 exp
          // Add logic for leveling up if necessary
        }))
      );
    }
    setGameState('home');
  };

  switch (gameState) {
    case 'start':
      return <StartScreen onStartGame={handleStartGame} />;
    case 'home':
      return (
        <HomeScreen 
          playerTeam={playerTeam} 
          eggs={eggs}
          onStartBattle={handleStartBattle}
        />
      );
    case 'battle':
      return (
        <BattleScreen 
          playerTeam={playerTeam} 
          enemyTeam={enemyTeam}
          onBattleEnd={handleBattleEnd} 
        />
      );
    default:
      return null;
  }
};

export default App;