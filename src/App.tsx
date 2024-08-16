import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';
import { Digimon, DigimonEgg } from './shared/types';
import './App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'start' | 'home' | 'battle'>('start');
  const [playerDigimon, setPlayerDigimon] = useState<Digimon | null>(null);
  const [party, setParty] = useState<Digimon[]>([]);
  const [eggs, setEggs] = useState<DigimonEgg[]>([]);

  const handleChooseDigimon = (digimon: Digimon) => {
    setPlayerDigimon(digimon);
    setParty([digimon]); // Initialize party with the chosen Digimon
    setGameState('home');
  };

  const handleStartBattle = () => {
    setGameState('battle');
  };

  const handleBattleEnd = (playerWon: boolean) => {
    // Handle post-battle logic here
    setGameState('home');
  };

  return (
    <div className="App">
      {gameState === 'start' && <StartScreen onChooseDigimon={handleChooseDigimon} />}
      {gameState === 'home' && playerDigimon && (
        <HomeScreen
          currentDigimon={playerDigimon}
          party={party}
          eggs={eggs}
          onStartBattle={handleStartBattle}
        />
      )}
      {gameState === 'battle' && playerDigimon && (
        <BattleScreen playerDigimon={playerDigimon} onBattleEnd={handleBattleEnd} />
      )}
    </div>
  );
};

export default App;